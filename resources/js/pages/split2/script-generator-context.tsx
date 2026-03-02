import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import PromptHistoryController from '@/actions/App/Http/Controllers/Split2/PromptHistoryController';
import DeletePromptHistoryController from '@/actions/App/Http/Controllers/Split2/DeletePromptHistoryController';
import GenerateSubPillarsController from '@/actions/App/Http/Controllers/Split2/GenerateSubPillarsController';
import GenerateAutomaticScriptController from '@/actions/App/Http/Controllers/Split2/GenerateAutomaticScriptController';
import GenerateScriptsController from '@/actions/App/Http/Controllers/Split2/GenerateScriptsController';
import ValidateScriptController from '@/actions/App/Http/Controllers/Split2/ValidateScriptController';

interface PromptHistoryEntry {
  id: string;
  prompt: string;
  clientPersona: string;
  contentPillar: string;
  subPillars: { value: string; label: string }[];
  chosenSubPillars: string[];
  hookType: string[];
  scripts: { subtitle: string; content: string; isValidated?: boolean }[];
  timestamp?: string;
  created_at?: string;
  isDeleted: boolean;
}

interface ScriptGeneratorContextType {
  userPrompt: string;
  setUserPrompt: (prompt: string) => void;
  contentPillar: string;
  setContentPillar: (pillar: string) => void;
  clientPersona: string;
  setClientPersona: (persona: string) => void;
  subPillars: { value: string; label: string }[];
  setSubPillars: (subPillars: { value: string; label: string }[]) => void;
  selectedSubPillars: string[];
  setSelectedSubPillars: (subPillars: string[]) => void;
  hookType: string[];
  setHookType: (hookType: string[]) => void;
  scripts: { subtitle: string; content: string; isValidated?: boolean }[];
  setScripts: (scripts: { subtitle: string; content: string; isValidated?: boolean }[]) => void;
  isLoadingSubPillars: boolean;
  isLoadingScripts: boolean;
  validated: boolean[];
  setValidated: (validated: boolean[]) => void;
  generateSubPillars: (isAutomatic: boolean) => Promise<void>;
  generateScripts: () => Promise<void>;
  validateScript: (scriptIndex: number, historyId: string) => Promise<void>;
  handleDelete: (scriptIndex: number) => void;
  promptHistory: PromptHistoryEntry[];
  selectPrompt: (entry: PromptHistoryEntry) => void;
  deletePrompt: (id: string) => void;
  loadPromptHistory: () => Promise<void>;
  historyId: string;
  setHistoryId: (id: string) => void;
  mode: 'automatic' | 'custom';
  setMode: (mode: 'automatic' | 'custom') => void;
}

const ScriptGeneratorContext = createContext<ScriptGeneratorContextType | undefined>(undefined);

export const ScriptGeneratorProvider = ({ children }: { children: React.ReactNode }) => {
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [contentPillar, setContentPillar] = useState<string>('');
  const [clientPersona, setClientPersona] = useState<string>('');
  const [subPillars, setSubPillars] = useState<{ value: string; label: string }[]>([]);
  const [selectedSubPillars, setSelectedSubPillars] = useState<string[]>([]);
  const [hookType, setHookType] = useState<string[]>([]);
  const [scripts, setScripts] = useState<{ subtitle: string; content: string; isValidated?: boolean }[]>([]);
  const [isLoadingSubPillars, setIsLoadingSubPillars] = useState<boolean>(false);
  const [isLoadingScripts, setIsLoadingScripts] = useState<boolean>(false);
  const [validated, setValidated] = useState<boolean[]>([]);
  const [promptHistory, setPromptHistory] = useState<PromptHistoryEntry[]>([]);
  const [historyId, setHistoryId] = useState<string>('');
  const [mode, setMode] = useState<'automatic' | 'custom'>('automatic');

  const loadPromptHistory = useCallback(async () => {
    try {
      const response = await axios.get(PromptHistoryController.url());
      setPromptHistory(response.data);
    } catch (error) {
      console.error('Error loading prompt history:', error);
      toast.error('Failed to load prompt history');
    }
  }, []);

  useEffect(() => {
    loadPromptHistory();
  }, [loadPromptHistory]);

  const deletePrompt = useCallback(
    async (id: string) => {
      try {
        await axios.delete(DeletePromptHistoryController.url(id));
        await loadPromptHistory();
        toast.success('Prompt deleted from history.');
      } catch (error) {
        console.error('Error deleting prompt:', error);
        toast.error('Failed to delete prompt');
      }
    },
    [loadPromptHistory]
  );

  const selectPrompt = useCallback(async (entry: PromptHistoryEntry) => {
    setUserPrompt(entry.prompt);
    setContentPillar(entry.contentPillar);
    setClientPersona(entry.clientPersona);
    setSubPillars(entry.subPillars);
    setMode('custom');
    setValidated(new Array(entry.scripts.length).fill(false));
    setHistoryId(entry.id);
  }, []);

  const generateSubPillars = useCallback(
    async (isAutomatic: boolean) => {
      if (!userPrompt.trim()) {
        toast.error('Prompt is required');
        return;
      }
      setIsLoadingSubPillars(true);
      try {
        const response = await axios.post(GenerateSubPillarsController.url(), { userPrompt });
        const data = response.data;
        setContentPillar(data.contentPillar);
        setClientPersona(data.clientPersona);
        setSubPillars(data.subPillars);
        setSelectedSubPillars([]);

        if (isAutomatic) {
          const selected = data.subPillars.slice(0, 5).map((sp: { value: string }) => sp.value);
          setSelectedSubPillars(selected);
          const hooksList = [
            'fix-a-problem',
            'quick-wins',
            'reactions-reviews',
            'personal-advice',
            'step-by-step-guides',
            'curiosity-surprises',
            'direct-targeting',
          ];
          setHookType(hooksList);

          try {
            const scriptRes = await axios.post(GenerateAutomaticScriptController.url(), {
              userPrompt,
              clientPersona: data.clientPersona,
              contentPillar: data.contentPillar,
              subPillars: data.subPillars,
              chosenSubPillars: selected.map(
                (value: string) => data.subPillars.find((sp: { value: string }) => sp.value === value)?.label || value
              ),
              hookType: hooksList,
            });
            const scriptData = scriptRes.data;
            setScripts(scriptData.scripts);
            setValidated(new Array(scriptData.scripts.length).fill(false));
            setHistoryId(scriptData.historyId);
            await loadPromptHistory();
            toast.success('Scripts generated successfully');
          } catch (scriptErr: any) {
            throw new Error(scriptErr.response?.data?.error || 'Failed to generate scripts');
          }
        } else {
          if (data.subPillars.length < 25) {
            toast.error(`Generated ${data.subPillars.length} sub-pillars instead of 25.`);
          } else {
            toast.success('Sub-pillars generated successfully');
          }
        }
      } catch (error: any) {
        console.error('Error generating sub-pillars:', error);
        toast.error(error.message || 'Failed to generate sub-pillars');
      } finally {
        setIsLoadingSubPillars(false);
      }
    },
    [userPrompt, loadPromptHistory]
  );

  const generateScripts = useCallback(async () => {
    if (!userPrompt.trim()) {
      toast.error('User prompt is required');
      return;
    }
    if (!clientPersona.trim() || !contentPillar.trim() || !Array.isArray(subPillars) || subPillars.length === 0) {
      toast.error('Please generate sub-pillars first.');
      return;
    }
    if (!Array.isArray(selectedSubPillars) || selectedSubPillars.length === 0) {
      toast.error('Please select at least one sub-pillar');
      return;
    }
    if (!Array.isArray(hookType) || hookType.length === 0) {
      toast.error('Please select at least one hook type');
      return;
    }

    setIsLoadingScripts(true);
    try {
      const response = await axios.post(GenerateScriptsController.url(), {
        userPrompt,
        clientPersona,
        contentPillar,
        subPillars,
        chosenSubPillars: selectedSubPillars.map(
          (value) => subPillars.find((sp) => sp.value === value)?.label || value
        ),
        hookType,
      });
      const data = response.data;
      setScripts(data.scripts);
      setValidated(new Array(data.scripts.length).fill(false));
      setHistoryId(data.historyId);
      await loadPromptHistory();
      toast.success('Scripts generated successfully');
    } catch (error: any) {
      console.error('Error generating scripts:', error);
      toast.error(`Failed to generate scripts: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsLoadingScripts(false);
    }
  }, [userPrompt, clientPersona, contentPillar, subPillars, selectedSubPillars, hookType, loadPromptHistory]);

  const validateScript = useCallback(
    async (scriptIndex: number, historyId: string) => {
      if (!scripts[scriptIndex]) {
        toast.error('Invalid script index');
        return;
      }
      try {
        const validateResponse = await axios.post(ValidateScriptController.url(), {
          userPrompt,
          clientPersona,
          contentPillar,
          subPillars,
          // @ts-ignore
          chosenSubPillars: selectedSubPillars.map(
            // @ts-ignore
            (value) => subPillars.find((sp) => sp.value === value)?.label || value
          ),
          hookType: hookType[scriptIndex % (hookType.length || 1)],
          script: scripts[scriptIndex],
          historyId,
        });

        setScripts((prev) => {
          const newScripts = [...prev];
          newScripts[scriptIndex] = { ...newScripts[scriptIndex], isValidated: true };
          return newScripts;
        });
        setValidated((prev) => {
          const newValidated = [...prev];
          newValidated[scriptIndex] = true;
          return newValidated;
        });

        toast.success(`Script "${scripts[scriptIndex].subtitle}" validated and saved successfully`);
      } catch (error: any) {
        console.error('Error validating/saving script:', error);
        toast.error(`Failed to validate/save script: ${error.response?.data?.error || error.message}`);
      }
    },
    [userPrompt, clientPersona, contentPillar, subPillars, selectedSubPillars, hookType, scripts]
  );

  const handleDelete = (scriptIndex: number) => {
    setScripts((prev) => prev.filter((_, i) => i !== scriptIndex));
    setValidated((prev) => prev.filter((_, i) => i !== scriptIndex));
  };

  return (
    <ScriptGeneratorContext.Provider
      value={{
        userPrompt, setUserPrompt, contentPillar, setContentPillar, clientPersona, setClientPersona,
        subPillars, setSubPillars, selectedSubPillars, setSelectedSubPillars, hookType, setHookType,
        scripts, setScripts, isLoadingSubPillars, isLoadingScripts, validated, setValidated,
        generateSubPillars, generateScripts, validateScript, handleDelete, promptHistory, selectPrompt,
        deletePrompt, loadPromptHistory, historyId, setHistoryId, mode, setMode,
      }}
    >
      {children}
    </ScriptGeneratorContext.Provider>
  );
};

export const useScriptGenerator = () => {
  const context = useContext(ScriptGeneratorContext);
  if (!context) {
    throw new Error('useScriptGenerator must be used within a ScriptGeneratorProvider');
  }
  return context;
};
