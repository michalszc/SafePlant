import { type CodegenConfig } from '@graphql-codegen/cli';
import { API_URL } from './config';

const config: CodegenConfig = {
    schema: API_URL,
    // this assumes that all your source files are in a top-level `src/` directory - you might need to adjust this to your file structure
    documents: ['src/**/*.{ts,tsx}'],
    generates: {
        './types/gqlTypes.ts': {
            plugins: ['typescript']
        }
    },
    ignoreNoDocuments: true
};

export default config;
