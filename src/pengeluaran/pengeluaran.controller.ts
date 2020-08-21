import { Controller, UseGuards, Get, Param, Post, Body, Query, Response, HttpStatus, HttpException, Put, UseInterceptors, UploadedFile, Res, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PengeluaranService } from './pengeluaran.service';
import { ApiBearerAuth, ApiTags, ApiBody } from '@nestjs/swagger';
import { CreateAssignedPengeluaranDTO, PengeluaranDTO } from './pengeluaran.dto';
import { PageQueryDTO } from 'src/shared/master.dto';
import { TransaksiService } from 'src/transaksi/transaksi.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from 'src/shared/helper';

@ApiBearerAuth()
@ApiTags('Pengeluaran')
@Controller('pengeluaran')
export class PengeluaranController {
    constructor(private pengeluaranService:PengeluaranService, private transaksiService:TransaksiService){}

    @UseGuards(AuthGuard('jwt'))
    @Get('')
    public async showAll(@Response() res, @Query() pageQuery:PageQueryDTO)
    {
        try{
            const query = await this.pengeluaranService.findAll(pageQuery);
            res.status(HttpStatus.OK).json(query);
        }            
        catch(error)
        {
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
        }
    }

    
    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    public async getById(@Response() res, @Param('id') ID:number){        
        try{
            const query = await this.pengeluaranService.findById(ID);
            res.status(HttpStatus.OK).json(query);
        }            
        catch(error)
        {
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('CreateAssigned')
    @ApiBody({type:CreateAssignedPengeluaranDTO})
    public async createAssignedPengeluaran(@Response() res, @Body() data:CreateAssignedPengeluaranDTO)
    {
        try{
            const query = await this.transaksiService.createPengeluaran(data);
            res.status(HttpStatus.OK).json(query);
        }            
        catch(error)
        {
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
        }
    }
    
    @UseGuards(AuthGuard('jwt'))
    @Post('createAsDraft')
    @ApiBody({type:PengeluaranDTO})
    public async createAsDraft(@Response() res, @Body() data:PengeluaranDTO)
    {        
        try{
            const query = await this.pengeluaranService.createAsDraft(data);
            res.status(HttpStatus.OK).json(query);
        }            
        catch(error)
        {
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Put('assignDraft/:id')
    public async assignPengeluaran(@Response() res, @Param('id') ID:number){
        try{
            const query = await this.pengeluaranService.assignPengeluaranDraft(ID);
            res.status(HttpStatus.OK).json(query);
        }            
        catch(error)
        {
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('upload')
    @UseInterceptors(
        FileInterceptor('image', {
            storage : diskStorage({
                destination : './uploads/pengeluaran',
                filename : editFileName
            }),
            fileFilter: imageFileFilter
        })
    )
    public async uploadedFile(@UploadedFile() file)
    {
        const response = {
            filename: file.filename,
        };
        return response;
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('image/:imgpath')
    public async seeUploadedFile(@Res() res, @Param('imgpath') image:string) {
        return res.sendFile(image, { root: './uploads/pengeluaran' });
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    public async delPemasukan(@Response() res, @Param('id') ID:number)
    {
        try{
            const query = await this.pengeluaranService.destroy(ID);
            res.status(HttpStatus.OK).json(query);
        }            
        catch(error)
        {
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
        }
    }
}
