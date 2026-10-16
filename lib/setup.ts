import { z } from "zod";
import { COLORS } from "./game";

export const settingsSchema = z.object({
  seconds: z
    .number()
    .refine((n) => [30, 60, 90, 120].includes(n), "Vyber platný čas."),
  target: z
    .number()
    .refine((n) => [30, 40, 50, 60].includes(n), "Vyber platné cieľové skóre."),
  openRounds: z.boolean(),
  sound: z.boolean(),
});
const teamSchema = z.object({
  name: z.string().max(24, "Názov môže mať najviac 24 znakov."),
  color: z.string().refine((c) => COLORS.includes(c), "Vyber farbu tímu."),
});
// Drafts may contain an unfinished name; starting a game requires the strict schema.
export const draftSchema = z.object({
  teams: z.array(teamSchema).min(2).max(6),
  settings: settingsSchema,
  preset: z.enum(["custom", "versus"]),
});
export const setupSchema = draftSchema
  .extend({
    teams: z
      .array(
        teamSchema.extend({
          name: teamSchema.shape.name.trim().min(1, "Doplň názov tímu."),
        }),
      )
      .min(2, "Potrebujete aspoň dva tímy.")
      .max(6, "Môže hrať najviac šesť tímov."),
  })
  .superRefine(({ teams }, ctx) => {
    const names = new Set<string>();
    teams.forEach((team, index) => {
      const normalized = team.name.toLocaleLowerCase("sk");
      if (names.has(normalized))
        ctx.addIssue({
          code: "custom",
          path: ["teams", index, "name"],
          message: "Každý tím potrebuje iný názov.",
        });
      names.add(normalized);
    });
  });
export type Draft = z.infer<typeof draftSchema>;
export const defaults: Draft = {
  teams: [
    { name: "Fialoví", color: COLORS[0] },
    { name: "Oranžoví", color: COLORS[1] },
  ],
  settings: { seconds: 60, target: 40, openRounds: true, sound: true },
  preset: "custom",
};
export function presetTeams(preset: Draft["preset"]): Draft["teams"] {
  return preset === "versus"
    ? [
        { name: "Muži", color: COLORS[0] },
        { name: "Ženy", color: COLORS[3] },
      ]
    : structuredClone(defaults.teams);
}
