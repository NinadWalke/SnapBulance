import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import  {ConfigService} from '@nestjs/config';

// cookie parsing
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService); // require configService to access env
  
  // define env and urls
  const environment = configService.get<string>('ENVIRONMENT') || 'development';
  const reactDevUrl =
    configService.get<string>('REACT_DEV_URL') || 'http://localhost:5173';
  const reactProdUrl = configService.get<string>('REACT_PROD_URL');

  // convert urls to array
  const allowedOrigins =
    environment === 'development' ? [reactDevUrl] : [reactProdUrl];
    
  // cors setup
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // use cookie parser
  app.use(cookieParser());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
