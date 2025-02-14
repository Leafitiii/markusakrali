import { webpackBundler } from '@payloadcms/bundler-webpack'; // bundler-import
import { mongooseAdapter } from '@payloadcms/db-mongodb'; // database-adapter-import
import { payloadCloud } from '@payloadcms/plugin-cloud';
import nestedDocs from '@payloadcms/plugin-nested-docs';
import redirects from '@payloadcms/plugin-redirects';
import seo from '@payloadcms/plugin-seo';
import type { GenerateTitle } from '@payloadcms/plugin-seo/types';
import stripePlugin from '@payloadcms/plugin-stripe';
import { slateEditor } from '@payloadcms/richtext-slate'; // editor-import
import dotenv from 'dotenv';
import path from 'path';
import { buildConfig } from 'payload/config';
import { s3Adapter } from '@payloadcms/plugin-cloud-storage/s3'

import Categories from './collections/Categories';
import { Media } from './collections/Media';
import { Orders } from './collections/Orders';
import { Pages } from './collections/Pages';
import Products from './collections/Products';
import Users from './collections/Users';
import BeforeDashboard from './components/BeforeDashboard';
import icon from './components/icon';
import CustomDashboard from './components/CustomDashboard';
import CustomNavbar from './components/CustomNavbar';


import BeforeLogin from './components/BeforeLogin';
import { createPaymentIntent } from './endpoints/create-payment-intent';
import { customersProxy } from './endpoints/customers';
import { productsProxy } from './endpoints/products';
import { seed } from './endpoints/seed';
import { Footer } from './globals/Footer';
import { Header } from './globals/Header';
import { Settings } from './globals/Settings';
import { priceUpdated } from './stripe/webhooks/priceUpdated';
import { productUpdated } from './stripe/webhooks/productUpdated';
import adminexc from './components/adminexc';
import { cloudStorage } from '@payloadcms/plugin-cloud-storage';


const adapter = s3Adapter({  
  config: {
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  region: process.env.S3_REGION,
  // ... Other S3 configuration
},
bucket: process.env.S3_BUCKET,
})

const generateTitle: GenerateTitle = () => {
  return 'Markus Kral'
}

const mockModulePath = path.resolve(__dirname, './emptyModuleMock.js')

dotenv.config({
  path: path.resolve(__dirname, '../../.env'),
})

export default buildConfig({
  admin: {
    css: path.resolve(__dirname, './hyd_custom.css'),

    user: Users.slug,
    bundler: webpackBundler(), // bundler-config
    meta: {
      titleSuffix: '- HYD',
      favicon: '/assets/favicon.svg',
      ogImage: './images/Logo_Eckmann_Schwarz.png',
    },
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeLogin` statement on line 15.
      beforeLogin: [BeforeLogin],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below and the import `BeforeDashboard` statement on line 15.
      beforeDashboard: [BeforeDashboard],
      
      views: {
        Dashboard: CustomDashboard,
    
      },
      graphics: {
        Icon: icon,
      },

     
    },
    webpack: config => {
      return {
        ...config,
        resolve: {
          ...config.resolve,
          alias: {
            ...config.resolve?.alias,
            dotenv: path.resolve(__dirname, './dotenv.js'),
            [path.resolve(__dirname, 'collections/Products/hooks/beforeChange')]: mockModulePath,
            [path.resolve(__dirname, 'collections/Users/hooks/createStripeCustomer')]:
              mockModulePath,
            [path.resolve(__dirname, 'collections/Users/endpoints/customer')]: mockModulePath,
            [path.resolve(__dirname, 'endpoints/create-payment-intent')]: mockModulePath,
            [path.resolve(__dirname, 'endpoints/customers')]: mockModulePath,
            [path.resolve(__dirname, 'endpoints/products')]: mockModulePath,
            [path.resolve(__dirname, 'endpoints/seed')]: mockModulePath,
            stripe: mockModulePath,
            express: mockModulePath,
          },
        },
      }
    },
  },
  editor: slateEditor({}), // editor-config
  // database-adapter-config-start
  db: mongooseAdapter({
    url: process.env.DATABASE_URI,
  }),
  // database-adapter-config-end
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  collections: [Products, Categories,  Users, Orders, Media,  Pages],
  globals: [],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  cors: ['https://checkout.stripe.com', process.env.PAYLOAD_PUBLIC_SERVER_URL || ''].filter(
    Boolean,
  ),
  csrf: ['https://checkout.stripe.com', process.env.PAYLOAD_PUBLIC_SERVER_URL || ''].filter(
    Boolean,
  ),
  endpoints: [
    {
      path: '/create-payment-intent',
      method: 'post',
      handler: createPaymentIntent,
    },
    {
      path: '/stripe/customers',
      method: 'get',
      handler: customersProxy,
    },
    {
      path: '/stripe/products',
      method: 'get',
      handler: productsProxy,
    },
    // The seed endpoint is used to populate the database with some example data
    // You should delete this endpoint before deploying your site to production
    {
      path: '/seed',
      method: 'get',
      handler: seed,
    },
  ],
  plugins: [
    cloudStorage({
      collections: {
        'media': {
          adapter: adapter, // see docs for the adapter you want to use
        },
      },
    }),
    stripePlugin({
      stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
      isTestKey: Boolean(process.env.PAYLOAD_PUBLIC_STRIPE_IS_TEST_KEY),
      stripeWebhooksEndpointSecret: process.env.STRIPE_WEBHOOKS_SIGNING_SECRET,
      rest: false,
      webhooks: {
        'product.created': productUpdated,
        'product.updated': productUpdated,
        'price.updated': priceUpdated,
      },
    }),
  /**  redirects({
      collections: ['pages', 'products'],
    }),**/
    nestedDocs({
      collections: ['categories'],
    }),
    seo({
      collections: ['pages', 'products'],
      generateTitle,
      uploadsCollection: 'media',
    }),
    payloadCloud(),
  ],
})
