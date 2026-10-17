"use client";
import { useTranslation } from "react-i18next";

import { teamName } from "@/i18n/resources";
import { Eyebrow } from "../ui/eyebrow";

import { useEffect, type RefObject } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Plus,
  Trophy,
  Users,
  Volume2,
  X,
} from "lucide-react";
import { COLORS } from "@/lib/game";
import { defaults, presetTeams, setupSchema, type Draft } from "@/lib/setup";
import { useGameStore, useGameStoreApi } from "@/stores/game-provider";
import { Button, IconButton } from "../ui/button";
import {
  FieldError,
  SegmentedControl,
  ToggleSwitch,
} from "../ui/form-controls";

export function SetupScreen({
  headingRef,
}: {
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const { t: tr } = useTranslation();
  const store = useGameStoreApi();
  const game = useGameStore((s) => s.game);
  const setView = useGameStore((s) => s.setView);
  const saveDraft = useGameStore((s) => s.saveDraft);
  const startGame = useGameStore((s) => s.startGame);
  const {
    getValues,
    register,
    control,
    handleSubmit,
    setValue,
    subscribe,
    clearErrors,
    formState: { errors },
  } = useForm<Draft>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      ...store.getState().draft,
      teams: store.getState().draft.teams.map((team) => ({
        ...team,
        name: teamName(team.name, tr),
      })),
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "teams",
  });
  const values = useWatch({ control }) as Draft;
  // RHF owns form editing; subscribe saves drafts without using React effects as a second form state.
  useEffect(
    () =>
      subscribe({
        formState: { values: true },
        callback: ({ values }) => saveDraft(values as Draft),
      }),
    [subscribe, saveDraft],
  );
  useEffect(() => {
    getValues("teams").forEach((team, index) => {
      const name = teamName(team.name, tr);
      if (name !== team.name) setValue(`teams.${index}.name`, name);
    });
  }, [tr, getValues, setValue]);
  const selectPreset = (preset: Draft["preset"]) => {
    setValue("preset", preset);
    replace(
      presetTeams(preset).map((team) => ({
        ...team,
        name: teamName(team.name, tr),
      })),
    );
    clearErrors("teams");
  };
  return (
    <main className="max-w-[520px] w-full m-[0_auto_36px] max-[601px]:mt-[-5px] motion-safe:animate-enter">
      <Button
        variant="text"
        className="ml-[-10px]"
        onClick={() => setView(game ? "game" : "home")}
      >
        <ArrowLeft size={18} /> {tr("Späť")}
      </Button>
      <div className="m-[14px_0_28px] [&_h1]:text-[38px] [&_h1]:font-black [&_h1]:tracking-[-1.6px] [&_h1]:m-[5px_0_6px] [&_p]:text-muted [&_p]:text-[15px] max-[601px]:[&_h1]:text-[34px]">
        <Eyebrow>{tr("NAJPRV SI TO NASTAVME")}</Eyebrow>
        <h1 ref={headingRef} tabIndex={-1}>
          {tr("Kto je v hre?")}
        </h1>
        <p>{tr("Zavolaj partiu. O zvyšok sa postaráme.")}</p>
      </div>
      <form
        onSubmit={handleSubmit((draft) => {
          startGame(draft);
        })}
        noValidate
      >
        <SegmentedControl
          label={tr("Zostavenie tímov")}
          className="mb-[28px] max-[601px]:[&_button]:text-[12px]"
          value={values.preset ?? defaults.preset}
          onChange={selectPreset}
          options={[
            {
              value: "custom",
              label: (
                <>
                  <Users size={18} /> {tr("Vlastné tímy")}
                </>
              ),
            },
            { value: "versus", label: tr("Muži proti ženám") },
          ]}
        />
        <section className="m-[0_0_25px] [&_h2]:text-[15px] [&_h2]:font-black [&_h2]:flex [&_h2]:items-center [&_h2]:gap-[9px]">
          <div className="flex justify-between items-center mb-3">
            <h2>{tr("Vaše tímy")}</h2>
            <span className="text-muted text-sm">{fields.length} / 6</span>
          </div>
          <div className="space-y-3">
            {fields.map((field, index) => {
              const team = values.teams?.[index] ?? field;
              const error = errors.teams?.[index]?.name?.message;
              return (
                <div
                  className="bg-[#fffcf7] [border:1px_solid_var(--color-line)] rounded-[15px] p-[9px_13px_3px] [&_input]:bg-transparent [&_input]:min-w-0 [&_input]:w-full [&_input]:h-[42px] [&_input]:text-[16px] [&_input]:font-extrabold [&_input]:pt-0 [&_input]:pb-0 [&_input]:pl-[4px] [&_input]:pr-[4px] [&_input]:rounded-[5px]"
                  key={field.id}
                >
                  <div className="flex items-center gap-[12px]">
                    <span
                      className="min-w-[31px] h-[32px] rounded-[10px] flex justify-center items-center text-[15px] font-black text-white"
                      style={{ background: team.color }}
                    >
                      {index + 1}
                    </span>
                    <label className="sr-only" htmlFor={`team-${index}`}>
                      {tr("setup.name", { number: index + 1 })}
                    </label>
                    <input
                      id={`team-${index}`}
                      {...register(`teams.${index}.name`)}
                      maxLength={24}
                      placeholder={tr("teams.number", { number: index + 1 })}
                      autoComplete="off"
                      aria-invalid={!!error}
                      aria-describedby={
                        error ? `team-error-${index}` : undefined
                      }
                    />
                    {fields.length > 2 && (
                      <IconButton
                        label={tr("setup.remove", { number: index + 1 })}
                        onClick={() => remove(index)}
                      >
                        <X size={18} />
                      </IconButton>
                    )}
                  </div>
                  <FieldError id={`team-error-${index}`} message={error} />
                  <div
                    className="flex flex-wrap ml-[39px] [&_button]:min-w-[48px] [&_button]:min-h-[48px] [&_button]:flex [&_button]:items-center [&_button]:justify-center [&_button_>_span]:w-[19px] [&_button_>_span]:h-[19px] [&_button_>_span]:rounded-[50%] [&_button_>_span]:text-white [&_button_>_span]:grid [&_button_>_span]:place-items-center [&_button[aria-pressed=true]_>_span]:[outline:2px_solid_#c9bece] [&_button[aria-pressed=true]_>_span]:[outline-offset:3px] max-[601px]:[&_button]:min-w-[48px] max-[601px]:[&_button]:min-h-[48px] max-[601px]:ml-0 max-[361px]:ml-0 max-[361px]:[&_button]:flex-1"
                    aria-label={tr("setup.teamColor", { number: index + 1 })}
                  >
                    {COLORS.map((color, ci) => (
                      <button
                        type="button"
                        key={color}
                        aria-label={tr("setup.color", {
                          color: [
                            tr("fialová"),
                            tr("oranžová"),
                            tr("zelená"),
                            tr("ružová"),
                            tr("modrá"),
                            tr("žltá"),
                          ][ci],
                        })}
                        aria-pressed={color === team.color}
                        onClick={() =>
                          setValue(`teams.${index}.color`, color, {
                            shouldDirty: true,
                          })
                        }
                      >
                        <span style={{ background: color }}>
                          {color === team.color && (
                            <Check size={13} strokeWidth={3} />
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          {fields.length < 6 && (
            <button
              type="button"
              className="flex justify-center items-center gap-[6px] w-full min-h-[48px] mt-[10px] text-[#84609e] text-[13px] font-extrabold [border:1px_dashed_#d6cadd] rounded-[12px] hover:bg-[#f0e8f5]"
              onClick={() => {
                setValue("preset", "custom");
                append({
                  name: tr("teams.number", { number: fields.length + 1 }),
                  color: COLORS[fields.length],
                });
              }}
            >
              <Plus size={18} /> {tr("Pridať tím")}
            </button>
          )}
        </section>
        <section className="m-[0_0_25px] [&_h2]:text-[15px] [&_h2]:font-black [&_h2]:flex [&_h2]:items-center [&_h2]:gap-[9px]">
          <h2>
            <Clock3 size={19} /> {tr("Čas na zadanie")}
          </h2>
          <Controller
            control={control}
            name="settings.seconds"
            render={({ field }) => (
              <SegmentedControl
                label={tr("Čas na zadanie")}
                className="mt-[11px] [&_button]:block [&_span]:text-[11px] [&_span]:font-semibold max-[601px]:[&_span]:block max-[601px]:[&_span]:text-[10px]"
                value={field.value}
                onChange={field.onChange}
                options={[30, 60, 90, 120].map((value) => ({
                  value,
                  label: (
                    <>
                      {value}
                      <span> {tr("sek.")}</span>
                    </>
                  ),
                }))}
              />
            )}
          />
        </section>
        <section className="m-[0_0_25px] [&_h2]:text-[15px] [&_h2]:font-black [&_h2]:flex [&_h2]:items-center [&_h2]:gap-[9px]">
          <h2>
            <Trophy size={19} /> {tr("Hráme do")}
          </h2>
          <Controller
            control={control}
            name="settings.target"
            render={({ field }) => (
              <SegmentedControl
                label={tr("Cieľové skóre")}
                className="mt-[11px] [&_button]:block [&_span]:text-[11px] [&_span]:font-semibold max-[601px]:[&_span]:block max-[601px]:[&_span]:text-[10px]"
                value={field.value}
                onChange={field.onChange}
                options={[30, 40, 50, 60].map((value) => ({
                  value,
                  label: (
                    <>
                      {value}
                      <span> {tr("pointsUnit", { count: value })}</span>
                    </>
                  ),
                }))}
              />
            )}
          />
        </section>
        <section className="m-[0_0_25px] [&_h2]:text-[15px] [&_h2]:font-black [&_h2]:flex [&_h2]:items-center [&_h2]:gap-[9px] flex items-center justify-between gap-[15px] [&_p]:text-[12px] [&_p]:text-muted [&_p]:mt-[4px]">
          <div>
            <h2>{tr("Občas hádajú všetci")}</h2>
            <p>{tr("Otvorené ťahy prinesú trochu vzrušenia.")}</p>
          </div>
          <Controller
            control={control}
            name="settings.openRounds"
            render={({ field }) => (
              <ToggleSwitch
                label={tr("Hádajú všetci")}
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </section>
        <section className="flex items-center justify-between gap-[15px] [&_p]:text-[12px] [&_p]:text-muted [&_p]:mt-[4px] mt-[-10px] text-[13px] text-[#7c7285]">
          <div className="flex items-center gap-3">
            <Volume2 size={18} />
            <span>{tr("Zvuky hry")}</span>
          </div>
          <Controller
            control={control}
            name="settings.sound"
            render={({ field }) => (
              <ToggleSwitch
                label={tr("Zvuky hry")}
                checked={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </section>
        <p className="text-[#8b7c6c] text-[12px] leading-[1.65] bg-[#f0eadd] rounded-[11px] pt-[12px] pb-[12px] pl-[15px] pr-[15px] m-[16px_0_22px]">
          {tr("18+ · Aj odvážnejšie zadania. Priprav si papier a pero.")}
        </p>
        <FieldError
          id="teams-error"
          message={errors.teams?.root?.message ?? errors.teams?.message}
        />
        <Button type="submit" className="w-full">
          {tr("Všetci pripravení? Hráme!")} <ArrowRight size={20} />
        </Button>
        {game && game.phase !== "finished" && (
          <p className="text-muted text-sm text-center mt-3">
            {tr("Spustením novej hry nahradíš rozohranú partiu.")}
          </p>
        )}
      </form>
    </main>
  );
}
