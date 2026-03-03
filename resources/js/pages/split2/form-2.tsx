import React, { useState, useEffect } from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { useScriptGenerator } from './script-generator-context';
import { MultiSelect } from './multi-select';
import { toast } from 'sonner';

interface FormData {
  subPillars: string[];
  hookTypes: string[];
}

const hookTypeOptions = [
  { value: 'fix-a-problem', label: 'Fix a Problem' },
  { value: 'quick-wins', label: 'Quick Wins' },
  { value: 'reactions-reviews', label: 'Reactions & Reviews' },
  { value: 'personal-advice', label: 'Personal Advice' },
  { value: 'step-by-step-guides', label: 'Step-by-Step Guides' },
  { value: 'curiosity-surprises', label: 'Curiosity & Surprises' },
  { value: 'direct-targeting', label: 'Direct Targeting' },
];

export const Form2 = () => {
  const {
    subPillars,
    selectedSubPillars,
    setSelectedSubPillars,
    hookType,
    setHookType,
    generateScripts,
    isLoadingScripts,
    userPrompt,
    clientPersona,
    contentPillar,
    mode,
  } = useScriptGenerator();

  const [timer, setTimer] = useState(180);

  // @ts-ignore
  const form = useForm<FormData>({
    defaultValues: {
      subPillars: selectedSubPillars,
      hookTypes: Array.isArray(hookType) ? hookType : hookType ? [hookType] : [],
    },
    resolver: async (data) => {
      const errors: Partial<Record<keyof FormData, { message: string }>> = {};
      if (!data.subPillars || data.subPillars.length === 0) {
        errors.subPillars = { message: 'Sub-pillars are required' };
      }
      if (!data.hookTypes || data.hookTypes.length === 0) {
        errors.hookTypes = { message: 'Hook types are required' };
      }
      return { values: data, errors };
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoadingScripts && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (!isLoadingScripts) {
      setTimer(180);
    }
    return () => clearInterval(interval);
  }, [isLoadingScripts, timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (mode === 'automatic') {
    return null;
  }

  const isFormDisabled = subPillars.length === 0 || selectedSubPillars.length === 0;

  const onSubmit = async () => {
    if (!userPrompt.trim()) {
      toast.error('User prompt is required');
      return;
    }
    if (!clientPersona.trim()) {
      toast.error('Client persona is required. Please generate sub-pillars first.');
      return;
    }
    if (!contentPillar.trim()) {
      toast.error('Content pillar is required. Please generate sub-pillars first.');
      return;
    }
    if (selectedSubPillars.length === 0 || form.getValues('hookTypes').length === 0) {
      toast.error('Please select sub-pillars and hook types');
      return;
    }
    await generateScripts();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="subPillars"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sub-Pillars</FormLabel>
              <FormControl>
                <MultiSelect
                  // @ts-ignore
                  options={subPillars}
                  defaultValue={selectedSubPillars}
                  onValueChange={(values) => {
                    setSelectedSubPillars(values);
                    form.setValue('subPillars', values);
                  }}
                  placeholder={subPillars.length === 0 ? 'No sub-pillars available' : 'Select sub-pillars'}
                  maxCount={3}
                  disabled={subPillars.length === 0}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="hookTypes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hook Types</FormLabel>
              <FormControl>
                <MultiSelect
                  options={hookTypeOptions}
                  defaultValue={field.value}
                  onValueChange={(values) => {
                    form.setValue('hookTypes', values);
                    setHookType(values);
                  }}
                  placeholder="Select hook types"
                  maxCount={3}
                  disabled={isFormDisabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={isLoadingScripts || isFormDisabled}
          className="w-full text-white"
        >
          {isLoadingScripts ? `Generating... (${formatTime(timer)})` : 'Generate Scripts'}
        </Button>
      </form>
    </Form>
  );
};

