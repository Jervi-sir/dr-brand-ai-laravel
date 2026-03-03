import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { usePage } from '@inertiajs/react';
import { echo } from '@laravel/echo-react';
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
  const { auth } = usePage<any>().props;
  const userId = auth?.user?.id;

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

  // Echo listener for background generation
  useEffect(() => {
    if (typeof window === 'undefined' || !userId) return;

    let e;
    try {
      e = echo();
    } catch {
      return;
    }

    if (!e) return;

    const channelName = `split2.${userId}`;
    console.log(`[Split2] Subscribing to channel: ${channelName}`);

    const channel = e.private(channelName);

    channel.on('pusher:subscription_succeeded', () => {
      console.log(`[Split2] Successfully subscribed to ${channelName}`);
    });

    channel.on('pusher:subscription_error', (status: any) => {
      console.error(`[Split2] Subscription error for ${channelName}:`, status);
      toast.error('Real-time connection failed. Please refresh.');
    });

    channel.listen('.Split2SubPillarsGenerated', (e: { contentPillar: string, clientPersona: string, subPillars: string[] }) => {
      console.log('[Split2] Received Split2SubPillarsGenerated', e);
      setIsLoadingSubPillars(false);
      setContentPillar(e.contentPillar);
      setClientPersona(e.clientPersona);
      setSubPillars(e.subPillars.map((sp: string) => ({ value: sp, label: sp })));
      setSelectedSubPillars([]);
      toast.success('Sub-pillars generated successfully');
    });

    channel.listen('.Split2ScriptsGenerated', (e: { scripts: any[], historyId: number }) => {
      console.log('[Split2] Received Split2ScriptsGenerated', e);
      setIsLoadingScripts(false);
      setScripts(e.scripts);
      setValidated(new Array(e.scripts.length).fill(false));
      setHistoryId(String(e.historyId));
      loadPromptHistory();
      toast.success('Scripts generated successfully');
    });

    channel.listen('.Split2ErrorReceived', (e: { error: string, type: string }) => {
      console.error('[Split2] Received Split2ErrorReceived', e);
      if (e.type === 'sub_pillars') {
        setIsLoadingSubPillars(false);
      } else {
        setIsLoadingScripts(false);
      }
      toast.error(e.error || 'Failed to generate');
    });

    return () => {
      console.log(`[Split2] Leaving channel: ${channelName}`);
      e.leave(channelName);
    };
  }, [userId, loadPromptHistory]);

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
        const response = await axios.post(GenerateSubPillarsController.url(), {
          userPrompt,
          is_automatic: isAutomatic
        });

        if (response.data.status === 'started') {
          toast.info('Sub-pillar generation started...');
          // Keep isLoadingSubPillars true, Echo handles results

          if (isAutomatic) {
            setIsLoadingScripts(true);
            toast.info('Automatic script generation will follow...');
          }
        }
      } catch (error: any) {
        setIsLoadingSubPillars(false);
        console.error('Error generating sub-pillars:', error);
        toast.error(error.message || 'Failed to generate sub-pillars');
      }
    },
    [userPrompt]
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

      if (response.data.status === 'started') {
        toast.info('Script generation started...');
        // Keep isLoadingScripts true
      }
    } catch (error: any) {
      setIsLoadingScripts(false);
      console.error('Error generating scripts:', error);
      toast.error(`Failed to generate scripts: ${error.response?.data?.error || error.message}`);
    }
  }, [userPrompt, clientPersona, contentPillar, subPillars, selectedSubPillars, hookType]);

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

        setScripts((prev: any[]) => {
          const newScripts = [...prev];
          newScripts[scriptIndex] = { ...newScripts[scriptIndex], isValidated: true };
          return newScripts;
        });
        setValidated((prev: boolean[]) => {
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
    setScripts((prev: any[]) => prev.filter((_, i) => i !== scriptIndex));
    setValidated((prev: boolean[]) => prev.filter((_, i) => i !== scriptIndex));
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
