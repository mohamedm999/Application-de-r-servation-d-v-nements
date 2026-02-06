import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsNumber,
  Min,
  Max,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';
import { EventStatus } from '../../common/enums/event-status.enum';

export class CreateEventDto {
  @ApiProperty({
    description: 'Title of the event',
    example: 'Introduction to TypeScript',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @ApiProperty({
    description: 'Description of the event',
    example: 'Learn the basics of TypeScript in this introductory workshop.',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  description!: string;

  @ApiProperty({
    description: 'Date and time of the event',
    example: '2023-12-25T10:00:00Z',
  })
  @IsDateString()
  date!: string;

  @ApiProperty({
    description: 'Location of the event',
    example: 'Main Conference Room',
  })
  @IsString()
  @IsNotEmpty()
  location!: string;

  @ApiProperty({
    description: 'Maximum capacity of the event',
    example: 50,
    minimum: 1,
    maximum: 10000,
  })
  @IsNumber()
  @Min(1)
  @Max(10000)
  capacity!: number;
}
