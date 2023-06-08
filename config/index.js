"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase_client = exports.dbConfig = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var dotenv = require('dotenv');
dotenv.config();
var client = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_PRIVATE_KEY);
exports.supabase_client = client;
var dbConfig = {
    client: client,
    tableName: 'documents',
    embeddingColumnName: 'embedding',
    queryName: 'match_documents'
};
exports.dbConfig = dbConfig;
