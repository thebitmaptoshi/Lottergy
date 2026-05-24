// ParamRow — the building block of the editor. Given a paramKey and the
// current GameConfig, renders the right control with its info bubble.
// All editor screens share this so the control mapping lives in one place.

import { Fragment } from "react";
import { Text, View } from "react-native";

import type { GameConfig, SamplingMode } from "@lottergy/core";
import type { GameDefinition, ParamKey } from "@lottergy/games";
import {
  CheckboxSet,
  DualRangeSlider,
  InfoBubble,
  NumberInput,
  SegmentedControl,
  Slider,
} from "@lottergy/ui";

export type ParamRowProps = {
  paramKey: ParamKey;
  game: GameDefinition;
  config: GameConfig;
  onChange: (next: GameConfig) => void;
};

export function ParamRow({ paramKey, game, config, onChange }: ParamRowProps) {
  const info = game.info.params[paramKey];
  if (!info) return null;

  return (
    <View className="gap-2">
      <InfoBubble title={info.title} body={info.body} />
      <View>{renderControl(paramKey, game, config, onChange)}</View>
    </View>
  );
}

function renderControl(
  key: ParamKey,
  game: GameDefinition,
  cfg: GameConfig,
  set: (c: GameConfig) => void,
): React.ReactElement {
  const w = game.matrix.whites_max;
  const r = game.matrix.reds_max;
  const decadeCount = Math.ceil(w / 10);

  switch (key) {
    case "whitesPool.frequencyPercentileRange":
      return (
        <DualRangeSlider
          ariaLabel="White percentile range"
          low={cfg.whitesPool.frequencyPercentileRange[0]}
          high={cfg.whitesPool.frequencyPercentileRange[1]}
          min={0}
          max={100}
          step={1}
          onChange={(range) =>
            set({ ...cfg, whitesPool: { ...cfg.whitesPool, frequencyPercentileRange: range } })
          }
        />
      );
    case "whitesPool.minFrequencyRate":
      return (
        <PctSlider
          value={cfg.whitesPool.minFrequencyRate}
          onChange={(v) => set({ ...cfg, whitesPool: { ...cfg.whitesPool, minFrequencyRate: v } })}
        />
      );
    case "whitesPool.topN":
      return (
        <NumberInput
          value={cfg.whitesPool.topN}
          onChange={(v) => set({ ...cfg, whitesPool: { ...cfg.whitesPool, topN: v } })}
          min={0}
          max={w}
          ariaLabel="White ball cap"
        />
      );
    case "redsPool.frequencyPercentileRange":
      return (
        <DualRangeSlider
          ariaLabel="Red percentile range"
          low={cfg.redsPool.frequencyPercentileRange[0]}
          high={cfg.redsPool.frequencyPercentileRange[1]}
          min={0}
          max={100}
          step={1}
          onChange={(range) =>
            set({ ...cfg, redsPool: { ...cfg.redsPool, frequencyPercentileRange: range } })
          }
        />
      );
    case "redsPool.minFrequencyRate":
      return (
        <PctSlider
          value={cfg.redsPool.minFrequencyRate}
          onChange={(v) => set({ ...cfg, redsPool: { ...cfg.redsPool, minFrequencyRate: v } })}
        />
      );
    case "redsPool.topN":
      return (
        <NumberInput
          value={cfg.redsPool.topN}
          onChange={(v) => set({ ...cfg, redsPool: { ...cfg.redsPool, topN: v } })}
          min={0}
          max={r}
        />
      );
    case "constraints.sum": {
      const sumCap = 5 * w;
      return (
        <DualRangeSlider
          ariaLabel="Sum range"
          low={cfg.constraints.sum.min}
          high={cfg.constraints.sum.max}
          min={0}
          max={sumCap}
          step={1}
          onChange={([min, max]) =>
            set({ ...cfg, constraints: { ...cfg.constraints, sum: { min, max } } })
          }
        />
      );
    }
    case "constraints.allowedOddCounts":
      return (
        <CheckboxSet
          ariaLabel="Allowed odd counts"
          options={[0, 1, 2, 3, 4, 5]}
          selected={cfg.constraints.allowedOddCounts}
          onChange={(next) =>
            set({ ...cfg, constraints: { ...cfg.constraints, allowedOddCounts: next } })
          }
        />
      );
    case "constraints.allowedLowCounts":
      return (
        <CheckboxSet
          ariaLabel="Allowed low counts"
          options={[0, 1, 2, 3, 4, 5]}
          selected={cfg.constraints.allowedLowCounts}
          onChange={(next) =>
            set({ ...cfg, constraints: { ...cfg.constraints, allowedLowCounts: next } })
          }
        />
      );
    case "constraints.lowCutoff":
      return (
        <Slider
          value={cfg.constraints.lowCutoff}
          onChange={(v) => set({ ...cfg, constraints: { ...cfg.constraints, lowCutoff: v } })}
          min={1}
          max={w}
          step={1}
          ariaLabel="Low cutoff"
        />
      );
    case "constraints.maxConsecutivePairs":
      return (
        <Slider
          value={cfg.constraints.maxConsecutivePairs}
          onChange={(v) => set({ ...cfg, constraints: { ...cfg.constraints, maxConsecutivePairs: v } })}
          min={0}
          max={4}
          step={1}
          ariaLabel="Max consecutive pairs"
        />
      );
    case "constraints.decadeSpan":
      return (
        <DualRangeSlider
          ariaLabel="Decade span"
          low={cfg.constraints.decadeSpan.min}
          high={cfg.constraints.decadeSpan.max}
          min={1}
          max={decadeCount}
          step={1}
          onChange={([min, max]) =>
            set({ ...cfg, constraints: { ...cfg.constraints, decadeSpan: { min, max } } })
          }
        />
      );
    case "preferences.weightOneConsecutivePair":
      return (
        <Slider
          value={cfg.preferences.weightOneConsecutivePair}
          onChange={(v) =>
            set({ ...cfg, preferences: { ...cfg.preferences, weightOneConsecutivePair: v } })
          }
          min={0}
          max={1}
          step={0.05}
          ariaLabel="1-consecutive penalty"
        />
      );
    case "numTickets":
      return (
        <NumberInput
          value={cfg.numTickets}
          onChange={(v) => set({ ...cfg, numTickets: v })}
          min={1}
          max={100}
          ariaLabel="Number of tickets"
        />
      );
    case "samplingMode":
      return (
        <SegmentedControl<SamplingMode>
          ariaLabel="Sampling mode"
          value={cfg.samplingMode}
          onChange={(v) => set({ ...cfg, samplingMode: v })}
          options={[
            { value: "random-weighted", label: "Random Weighted" },
            { value: "top-picks", label: "Top Picks" },
          ]}
        />
      );
    default:
      return <Fragment />;
  }
}

function PctSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View>
      <Slider value={value} onChange={onChange} min={0} max={0.2} step={0.001} />
      <Text className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        = {(value * 100).toFixed(2)}%
      </Text>
    </View>
  );
}
