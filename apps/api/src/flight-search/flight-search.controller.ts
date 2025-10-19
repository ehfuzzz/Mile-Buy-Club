import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FlightSearchService } from './flight-search.service';

export interface FlightSearchRequest {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  passengers?: {
    adults: number;
    children?: number;
    infants?: number;
  };
  cabin?: string;
}

@ApiTags('flight-search')
@Controller('flight-search')
export class FlightSearchController {
  constructor(private readonly flightSearchService: FlightSearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search for flights using available providers' })
  @ApiQuery({ name: 'origin', description: 'Origin airport code (e.g., NYC, LAX)' })
  @ApiQuery({ name: 'destination', description: 'Destination airport code (e.g., LHR, CDG)' })
  @ApiQuery({ name: 'departDate', description: 'Departure date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'returnDate', description: 'Return date (YYYY-MM-DD)', required: false })
  @ApiQuery({ name: 'passengers', description: 'Number of passengers', required: false })
  @ApiQuery({ name: 'cabin', description: 'Cabin class', required: false })
  async searchFlights(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
    @Query('departDate') departDate: string,
    @Query('returnDate') returnDate?: string,
    @Query('passengers') passengers?: string,
    @Query('cabin') cabin?: string,
  ) {
    const searchParams = {
      origin,
      destination,
      departDate,
      returnDate,
      passengers: passengers ? JSON.parse(passengers) : { adults: 1 },
      cabin,
    };

    return this.flightSearchService.searchFlights(searchParams);
  }

  @Post('search')
  @ApiOperation({ summary: 'Search for flights using POST with request body' })
  async searchFlightsPost(@Body() searchRequest: FlightSearchRequest) {
    return this.flightSearchService.searchFlights(searchRequest);
  }

  @Post('populate-sample')
  @ApiOperation({ summary: 'Populate database with sample flight data' })
  async populateSampleData() {
    return this.flightSearchService.populateSampleData();
  }
}
