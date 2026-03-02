import { Head } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { Form1 } from './form-1';
import { Form2 } from './form-2';
import {
  ScriptGeneratorProvider,
  useScriptGenerator,
} from './script-generator-context';
import { Button } from '@/components/ui/button';
import { MinimalTiptapEditor } from '@/components/minimal-tiptap';
import { Content } from '@tiptap/react';
import ChatLayout from '@/layouts/chat-layout/layout';

function PageContent() {
  const {
    scripts,
    isLoadingScripts,
    validated,
    validateScript,
    handleDelete,
    setScripts,
    historyId,
    mode,
    clientPersona,
    contentPillar,
    subPillars,
    selectedSubPillars,
  } = useScriptGenerator();

  return (
    <div className="flex h-full w-full flex-col bg-background">
      <Head title="Split Generator" />
      {/* Main Content */}
      <div className="flex h-full min-h-[calc(100vh-64px)] flex-1 flex-col overflow-hidden md:flex-row">
        {/* Left Panel: Form and Metadata */}
        <div className="w-full overflow-y-auto border-border p-6 md:w-1/2 md:border-r-2">
          <h2 className="mb-4 text-2xl font-bold">
            Script Generator
          </h2>
          <div>
            <Form1 />
            {mode === 'custom' && (
              <div className="mt-8">
                <Form2 />
              </div>
            )}
            {mode === 'automatic' &&
              clientPersona &&
              contentPillar && (
                <div className="mt-6 rounded-xl border bg-muted/50 p-4">
                  <h3 className="mb-2 text-lg font-semibold">
                    Generated Metadata
                  </h3>
                  <p>
                    <strong>Client Persona:</strong>{' '}
                    {clientPersona}
                  </p>
                  <p>
                    <strong>Content Pillar:</strong>{' '}
                    {contentPillar}
                  </p>
                  <div className="mt-2">
                    <strong>Sub-Pillars:</strong>
                    <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
                      {selectedSubPillars.map((value) => (
                        <li key={value}>
                          {subPillars.find(
                            (sp) =>
                              sp.value === value,
                          )?.label || value}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
          </div>
        </div>
        {/* Right Panel: Scripts */}
        <div className="min-h-screen w-full flex-1 overflow-y-auto p-6">
          <h2 className="mb-6 text-2xl font-bold">
            Generated Scripts ({scripts.length})
          </h2>
          <div className="space-y-6">
            {isLoadingScripts ? (
              <div className="mt-10 flex items-center justify-center gap-4 rounded-xl border border-dashed p-10">
                <p className="animate-pulse text-muted-foreground">
                  Generating scripts...
                </p>
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : scripts.length === 0 ? (
              <div className="flex items-center justify-center rounded-xl border border-dashed bg-muted/20 p-12">
                <p className="text-center text-muted-foreground">
                  No scripts generated yet. Fill out the form
                  and click "Generate".
                </p>
              </div>
            ) : (
              scripts.map((script, index) => (
                <div
                  key={index}
                  className="space-y-4 rounded-xl border bg-card p-5 shadow-sm"
                >
                  <h3 className="w-full border-b pb-3 text-right text-xl font-semibold text-wrap">
                    {script.subtitle}
                  </h3>

                  <div dir="rtl">
                    <MinimalTiptapEditor
                      value={script.content}
                      onChange={(value: Content) => {
                        const newScripts = [...scripts];
                        newScripts[index].content =
                          value as string;
                        setScripts(newScripts);
                      }}
                      className="min-h-[150px] w-full border border-border bg-muted transition-shadow focus-within:ring-2 focus-within:ring-ring"
                      editorContentClassName="p-4"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant={
                        validated[index]
                          ? 'secondary'
                          : 'default'
                      }
                      onClick={() =>
                        validateScript(index, historyId)
                      }
                      disabled={validated[index]}
                    >
                      {validated[index]
                        ? '✓ Validated'
                        : 'Validate'}
                    </Button>
                    {!validated[index] && (
                      <Button
                        variant="destructive"
                        onClick={() =>
                          handleDelete(index)
                        }
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ChatLayout title="Split v2">
      <ScriptGeneratorProvider>
        <PageContent />
      </ScriptGeneratorProvider>
    </ChatLayout>
  );
}
