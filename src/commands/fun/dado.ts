import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { Command } from 'classes/Command';

export default new Command({
	data: new SlashCommandBuilder()
		.setName('dado')
		.setDescription('rola um dado')
		.addIntegerOption((option) =>
			option
				.setName('lados')
				.setDescription('quantos lados o dado terá')
				.setMinValue(2)
				.setMaxValue(100)
				.setRequired(false)
		)
		.addIntegerOption((option) =>
			option
				.setName('quantidade')
				.setDescription('quantos dados serão rolados')
				.setMinValue(1)
				.setMaxValue(25)
				.setRequired(false)
		),

	execute: async ({ interaction }) => {
		await interaction.deferReply({ ephemeral: false });

		const lados = interaction.options.getInteger('lados') || 6;
		const quantidade = interaction.options.getInteger('quantidade') || 1;

		let embed = new EmbedBuilder()
			.setColor([0, 255, 255])
			.setTitle(`🎲 Dados | D${lados} 🎲`);

		if (quantidade > 1) {
			let total = 0;

			for (let i = 0; i < quantidade; i++) {
				const dado = Math.ceil(Math.random() * lados);

				embed.addFields([
					{ name: `Dado #${i + 1}`, value: `${dado}`, inline: true },
				]);

				total += dado;
			}

			embed
				.setDescription(`TOTAL: **${total}**`)
				.setFooter({ text: `máximo: ${quantidade * lados}` });
		} else embed.setDescription(`Dado: **${Math.ceil(Math.random() * lados)}**`);

		interaction.editReply({
			embeds: [embed],
		});
	},
});
