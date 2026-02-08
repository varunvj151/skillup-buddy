import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { allTopics } from '@/data/topics';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle, Lightbulb, ArrowRight, BookOpen, Calculator, AlertTriangle, Zap, GraduationCap } from 'lucide-react';

export default function TopicLesson() {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const topic = allTopics.find(t => t.id === topicId);

  if (!topic) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Topic not found</p>
      </div>
    );
  }

  const lesson = topic.lessons[0]; // For now, show first lesson

  // Helper to parse the markdown-like content string into sections
  const parseContent = (content: string) => {
    // If content is simple (old data), just return as paragraphs
    if (!content.includes('## ')) {
      return [{ type: 'text', content }];
    }

    // Split by "---" separator we added in topics.ts
    const sections = content.split('\n\n---\n\n').map(section => {
      const lines = section.split('\n');
      const title = lines.find(l => l.startsWith('## '))?.replace('## ', '') || '';

      // Extract Concept, Formula, Technique using regex or simple matching
      const conceptMatch = section.match(/\*\*Concept:\*\*\s*([\s\S]*?)(?=\n\n\*\*|$)/);
      const formulaMatch = section.match(/\*\*Formula:\*\*\s*([\s\S]*?)(?=\n\n\*\*|$)/);
      const techniqueMatch = section.match(/\*\*Technique:\*\*\s*([\s\S]*?)(?=\n\n\*\*|$)/);

      return {
        title,
        concept: conceptMatch ? conceptMatch[1].trim() : '',
        formula: formulaMatch ? formulaMatch[1].trim() : '',
        technique: techniqueMatch ? techniqueMatch[1].trim() : '',
        fullText: section // Fallback
      };
    });

    return sections;
  };

  const parsedSections = parseContent(lesson.content);

  // Helper to get difficulty color
  const getDifficultyColor = (problem: string) => {
    if (problem.toLowerCase().includes('easy')) return 'bg-green-100 text-green-800 border-green-200';
    if (problem.toLowerCase().includes('medium')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (problem.toLowerCase().includes('hard')) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-secondary text-secondary-foreground';
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header title={topic.name} showBack />

      <main className="px-4 py-8 max-w-4xl mx-auto pb-32">
        {/* Topic Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8 animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 transform transition-transform hover:scale-105 duration-300">
            <span className="text-4xl filter drop-shadow-md">{topic.icon}</span>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                {topic.category.toUpperCase()}
              </Badge>
              <span className="text-sm text-muted-foreground font-medium">
                {lesson.examples.length} Questions
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">{topic.name}</h1>
            <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">{topic.description}</p>
          </div>
        </div>

        {/* Learning Sections */}
        <div className="space-y-8 mb-12">
          {parsedSections.map((section: any, idx) => (
            <Card key={idx} className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-800">
                  {section.title || lesson.title}
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {section.concept && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" /> Concept
                    </h3>
                    <p className="text-slate-700 leading-relaxed text-lg">{section.concept}</p>
                  </div>
                )}

                {section.formula && (
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 space-y-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Calculator className="w-16 h-16 text-indigo-600" />
                    </div>
                    <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                      <Calculator className="w-4 h-4" /> Formula
                    </h3>
                    <div className="font-mono text-lg md:text-xl text-indigo-900 bg-white/50 inline-block px-3 py-1 rounded-md border border-indigo-100/50 shadow-sm">
                      {section.formula}
                    </div>
                  </div>
                )}

                {section.technique && (
                  <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5 space-y-2">
                    <h3 className="text-sm font-bold text-amber-600 uppercase tracking-wider flex items-center gap-2">
                      <Zap className="w-4 h-4" /> Pro Technique
                    </h3>
                    <p className="text-amber-900/80 leading-relaxed font-medium">
                      {section.technique}
                    </p>
                  </div>
                )}

                {/* Fallback if parsing failed or old content */}
                {!section.concept && !section.formula && (
                  <div className="prose prose-slate max-w-none">
                    {section.content?.split('\n').map((p: string, i: number) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Practice Examples */}
        <div className="mb-12 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </span>
              Solved Examples
            </h2>
            <Badge variant="outline" className="text-slate-500 border-slate-300">
              {lesson.examples.length} Problems
            </Badge>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {lesson.examples.map((example, index) => {
              const difficultyColor = getDifficultyColor(example.problem);
              // Extract difficulty text if present (e.g. "Easy: ...")
              const difficultyText = example.problem.split(':')[0];
              const cleanProblem = example.problem.includes(':') ? example.problem.split(':').slice(1).join(':').trim() : example.problem;

              return (
                <AccordionItem key={index} value={`item-${index}`} className="bg-white border border-slate-200 rounded-xl px-2 shadow-sm hover:shadow-md transition-all duration-200">
                  <AccordionTrigger className="hover:no-underline px-4 py-4">
                    <div className="flex flex-col sm:flex-row text-left gap-3 w-full pr-4">
                      <Badge className={`w-fit h-fit shrink-0 ${difficultyColor} border`}>
                        {difficultyText.length < 10 ? difficultyText : `Q${index + 1}`}
                      </Badge>
                      <span className="text-slate-700 font-medium">
                        {cleanProblem}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-1">
                    <div className="pl-4 border-l-2 border-slate-200 space-y-4 mt-2">
                      <div className="bg-slate-50 rounded-lg p-4 font-mono text-sm text-slate-700 whitespace-pre-wrap border border-slate-200/60">
                        {/* Highlights "Step X:" in bold */}
                        {example.solution.split('\n').map((line, i) => (
                          <div key={i} className="mb-1">
                            {line.startsWith('Step') ? (
                              <span className="font-bold text-slate-900">{line}</span>
                            ) : (
                              line
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-start gap-2 text-sm text-slate-500 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                        <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                        <span className="leading-relaxed">
                          <span className="font-semibold text-blue-700">Explanation:</span> {example.explanation}
                        </span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        {/* Tips & Shortcuts */}
        <div className="animate-slide-up" style={{ animationDelay: '600ms' }}>
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </span>
            Smart Tricks & Pitfalls
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lesson.tips.map((tip, index) => {
              const isMistake = tip.startsWith("Mistake:");
              const cleanTip = isMistake ? tip.replace("Mistake:", "").trim() : tip;

              return (
                <Card
                  key={index}
                  className={`p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${isMistake
                    ? 'bg-red-50/50 border-red-100 hover:border-red-200'
                    : 'bg-amber-50/50 border-amber-100 hover:border-amber-200'
                    }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-xl shrink-0 ${isMistake ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                      {isMistake ? <AlertTriangle className="w-5 h-5" /> : <Lightbulb className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className={`font-bold mb-1 ${isMistake ? 'text-red-700' : 'text-amber-700'
                        }`}>
                        {isMistake ? 'Common Mistake' : 'Pro Tip'}
                      </h4>
                      <p className={`text-sm leading-relaxed ${isMistake ? 'text-red-800/80' : 'text-amber-800/80'
                        }`}>
                        {cleanTip}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      {/* Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden md:block text-sm text-slate-500">
            Feeling confident? Test your knowledge now!
          </div>
          <Button
            onClick={() => navigate(`/aptitude/test?topic=${topicId}`)}
            size="lg"
            className="w-full md:w-auto text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
          >
            Start Practice Test <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
