import { Knex } from 'knex'

// prettier-ignore
export async function up(knex: Knex): Promise<void> {
  await knex.raw('alter table `posting` drop column `photos`')
  await knex.raw('alter table `posting` drop column `tags`')
  await knex.raw('alter table `posting` drop column `comments`')
  await knex.raw('alter table `posting` drop column `likes`')
  await knex.raw('alter table `posting` drop column `description`')
  await knex.raw('alter table `posting` drop column `title`')
  await knex.raw('alter table `posting` drop column `user_id`')

  if (!(await knex.schema.hasTable('post'))) {
    await knex.schema.createTable('post', table => {
      table.increments('id')
      table.integer('user_id').unsigned().notNullable().references('user.id')
      table.text('title').notNullable()
      table.text('description').notNullable()
      table.integer('likes').notNullable()
      table.integer('comments').notNullable()
      table.text('tags').notNullable()
      table.text('photos').notNullable()
      table.timestamps(false, true)
    })
  }
}

// prettier-ignore
export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('post')
  await knex.raw('alter table `posting` add column `user_id` integer not null')
  await knex.raw('alter table `posting` add column `title` text not null')
  await knex.raw('alter table `posting` add column `description` text not null')
  await knex.raw('alter table `posting` add column `likes` text not null')
  await knex.raw('alter table `posting` add column `comments` text not null')
  await knex.raw('alter table `posting` add column `tags` text not null')
  await knex.raw('alter table `posting` add column `photos` text not null')
}
