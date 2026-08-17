import type {NextConfig} from "next"; const config:NextConfig={output:process.env.STANDALONE_BUILD==="true"?"standalone":undefined,poweredByHeader:false}; export default config;
