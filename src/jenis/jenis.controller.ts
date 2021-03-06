import { Controller, UseGuards, Get, Post, Param, Body, Response, HttpStatus, Query, Put, HttpException, Delete } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiBody } from '@nestjs/swagger';
import { JenisService } from './jenis.service';
import { AuthGuard } from '@nestjs/passport';
import { JenisDTO, JenisPageQueryDTO } from './jenis.dto';
import { PageQueryDTO } from 'src/shared/master.dto';

@ApiBearerAuth()
@ApiTags('Jenis')
@Controller('jenis')
export class JenisController {
    constructor(private jenisService:JenisService){}

    @UseGuards(AuthGuard('jwt'))
    @Get('/')
    public async showAll(@Response() res, @Query() queryParams:JenisPageQueryDTO)
    {
        const query = await this.jenisService.findAll(queryParams);
        if(!query)
            res.status(HttpStatus.BAD_GATEWAY);
        else
            res.status(HttpStatus.OK).json(query);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    public async getJenisById(@Response() res, @Param('id') ID:number)
    {
        const query = await this.jenisService.findById(ID);
        if(!query)
            res.status(HttpStatus.BAD_GATEWAY);
        else
            res.status(HttpStatus.OK).json(query);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('')
    @ApiBody({type:JenisDTO})
    public async postJenis(@Response() res, @Body() data:JenisDTO)
    {
        try{
            const query = await this.jenisService.create(data);
            res.status(HttpStatus.OK).json(query);
        }            
        catch(error)
        {
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Put(':id')
    @ApiBody({type:JenisDTO})
    public async putJenis(@Response() res, @Body() data:JenisDTO, @Param('id') ID:number)
    {
        try{
            const query = await this.jenisService.update(ID, data);
            res.status(HttpStatus.OK).json(query);
        }            
        catch(error)
        {
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
        }
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    public async delJenis(@Response() res, @Param('id') ID:number)
    {
        try{
            const query = await this.jenisService.destroy(ID);
            res.status(HttpStatus.OK).json(query);
        }            
        catch(error)
        {
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
        }
    }
}
