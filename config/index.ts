import { createClient } from '@supabase/supabase-js';

const dotenv = require('dotenv');
dotenv.config();

const client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PRIVATE_KEY!);

const dbConfig = {
	client,
	tableName: 'documents',
	embeddingColumnName: 'embedding',
	queryName: 'match_documents'
};

export { dbConfig, client as supabase_client };
