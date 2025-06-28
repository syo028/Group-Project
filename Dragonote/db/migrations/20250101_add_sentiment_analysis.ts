import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  // 為評論表添加情感分析欄位
  await knex.schema.alterTable('comment', table => {
    table.string('sentiment').defaultTo('neutral') // positive, negative, neutral
    table.decimal('sentiment_confidence', 3, 2).defaultTo(0.5) // 0.00-1.00
    table.json('sentiment_scores') // 儲存詳細分數
    table.timestamp('sentiment_analyzed_at').nullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('comment', table => {
    table.dropColumn('sentiment')
    table.dropColumn('sentiment_confidence')
    table.dropColumn('sentiment_scores')
    table.dropColumn('sentiment_analyzed_at')
  })
}
