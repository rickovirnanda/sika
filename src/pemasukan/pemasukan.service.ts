import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PemasukanEntity } from './pemasukan.entity';
import { Repository, FindManyOptions, Like } from 'typeorm';
import { PemasukanRO } from './pemasukan.ro';
import { clearResult, toSQLDate } from 'src/shared/helper';
import { TransaksiService } from 'src/transaksi/transaksi.service';
import { CreateTransaksiDTO } from 'src/transaksi/transaksi.dto';
import { IPagedResult, IPagedQuery } from 'src/shared/master.model';
import { PageQueryDTO } from 'src/shared/master.dto';
import { PemasukanDTO, CreatePemasukanDTO, UpdatePemasukanDTO } from './pemasukan.dto';
import { JenisService } from 'src/jenis/jenis.service';
import { JenisEntity } from 'src/jenis/jenis.entity';

@Injectable()
export class PemasukanService {
    private readonly logger = new Logger(PemasukanService.name);
    constructor(
        @InjectRepository(PemasukanEntity) private pemasukanRepo:Repository<PemasukanEntity>,
        private transaksiService:TransaksiService,
        private jenisService:JenisService,
    ){}

    private querySelection(selection = null)
    {
        return {
            where:{
                ...selection,
                isDeleted:0
            },
            relations : ['jenis']
        }
    }

    public async findAll(query:PageQueryDTO):Promise<IPagedResult>
    {
        query.search = query.search ? query.search : '';
        const option:FindManyOptions = {
            take:query.itemsPerPage,
            skip:((query.page-1)*query.itemsPerPage),
            where:[
                { isDeleted:0 },
                { namaPenanggungJawab:Like(`%${query.search}%`), isDeleted:0 },
                { nomorKas:Like(`%${query.search}%`), isDeleted:0 },
                { keterangan:Like(`%${query.search}%`), isDeleted:0 },
                { jumlah:Like(`%${query.search}%`), isDeleted:0 },
                { judul:Like(`%${query.search}%`), isDeleted:0 }
            ],
            order:{
                ID:query.order == 1 ? 'ASC' :'DESC'
            },
            relations : ['jenis']
        };
        const [result, total] = await this.pemasukanRepo.findAndCount(option);
        const data = result.map(x=>{
            return clearResult(this.pemasukanToRO(x));
        });
        
        return  <any>{
            currentPage:query.page,
            totalRecords: total,
            data:data,
            resultPerPage:query.itemsPerPage
        };
    }

    public async findById(ID:number) : Promise<PemasukanRO | null>{
        const pemasukan = await this.pemasukanRepo.findOneOrFail(this.querySelection({ID}));

        const res = <PemasukanRO>clearResult(this.pemasukanToRO(pemasukan));
        return res;
    }

    public async update(ID:number, data:Partial<UpdatePemasukanDTO>)
    {
        const jenis = <JenisEntity>(await this.jenisService.findById(data.jenisID));

        const dataPemasukan = await this.pemasukanRepo.create({...data, jenis:jenis});

        await this.pemasukanRepo.update(ID, dataPemasukan);

        await this.transaksiService.update(ID, data.transaksiID, <CreatePemasukanDTO>data);
    } 

    public async create(data:CreatePemasukanDTO)
    {
        const jenis = await this.jenisService.findById(data.jenisID);

        const dataPemasukan = await this.pemasukanRepo.create({...data, jenis:jenis});
        const pemasukanID:number = (await this.pemasukanRepo.save(dataPemasukan)).ID;

        const transaksiID = (await this.transaksiService.create(data, pemasukanID)).ID;

        await this.pemasukanRepo.update(pemasukanID, {transaksiID});
    }

    private pemasukanToRO(pemasukan:PemasukanEntity):PemasukanRO
    {
        const responseObject:PemasukanRO = {
            ...pemasukan,
            jenisID:pemasukan.jenis ? pemasukan.jenis.ID : null,
            jenisNama:pemasukan.jenis ? pemasukan.jenis.nama : null
        }
        
        delete responseObject['jenis'];

        return responseObject;
    }

    public async destroy(ID:number)
    {
        const pemasukanRow:PemasukanRO = await this.findById(ID);
        if(pemasukanRow){
            await this.pemasukanRepo.update(ID, {isDeleted:1});
            await this.transaksiService.delete(ID);
        }else
            throw new HttpException('Hanya Pemasukan yang terdaftar saja yang dapat dihapus', HttpStatus.BAD_REQUEST);
    }
}
