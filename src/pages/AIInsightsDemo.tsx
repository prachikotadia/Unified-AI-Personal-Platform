import React, { useState } from 'react';
import AIInsightsPanel from '@/components/ai/AIInsightsPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Zap, Brain, TrendingUp } from 'lucide-react';

export default function AIInsightsDemo() {
  const [activeModule, setActiveModule] = useState<string | undefined>(undefined);

  const modules = [
    { id: 'all', name: 'All Insights', description: 'Cross-module AI insights' },
    { id: 'finance', name: 'Finance', description: 'Financial analysis and recommendations' },
    { id: 'fitness', name: 'Fitness', description: 'Health and workout insights' },
    { id: 'travel', name: 'Travel', description: 'Travel planning and suggestions' },
    { id: 'marketplace', name: 'Marketplace', description: 'Shopping and product insights' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Insights Demo
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience dynamic AI insights powered by GPT-4 and LangChain. 
            Every refresh generates new personalized recommendations with 85-92% accuracy.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-blue-100 rounded-full w-fit mb-3">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Real-time Generation</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 text-sm">
                Fresh insights generated on every refresh using advanced AI models
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-green-100 rounded-full w-fit mb-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">85-92% Accuracy</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 text-sm">
                High-precision predictions and recommendations across all modules
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-purple-100 rounded-full w-fit mb-3">
                <RefreshCw className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Dynamic Content</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 text-sm">
                Personalized insights based on user context and behavior patterns
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Module Tabs */}
        <Tabs value={activeModule || 'all'} onValueChange={setActiveModule} className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList className="grid w-full max-w-2xl grid-cols-5">
              {modules.map((module) => (
                <TabsTrigger
                  key={module.id}
                  value={module.id}
                  className="flex flex-col items-center gap-1 py-3"
                >
                  <span className="text-xs font-medium">{module.name}</span>
                  <span className="text-xs text-gray-500 hidden sm:block">
                    {module.description}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {modules.map((module) => (
            <TabsContent key={module.id} value={module.id} className="mt-0">
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        {module.name}
                      </CardTitle>
                      <p className="text-gray-600 mt-1">{module.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        GPT-4 + LangChain
                      </Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        85-92% Accuracy
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <AIInsightsPanel 
                    module={module.id === 'all' ? undefined : module.id} 
                    count={3}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Instructions */}
        <Card className="mt-8 border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              How to Use
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Try These Actions:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Click the <strong>Refresh</strong> button to generate new insights</li>
                  <li>• Switch between different modules using the tabs above</li>
                  <li>• Click on action buttons to see how insights lead to actions</li>
                  <li>• Notice how insights change with each refresh</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What You'll See:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• <strong>Dynamic Content:</strong> Different insights every time</li>
                  <li>• <strong>Priority Levels:</strong> High, medium, and low priority badges</li>
                  <li>• <strong>Confidence Scores:</strong> AI model confidence percentages</li>
                  <li>• <strong>Actionable Steps:</strong> Specific recommendations and next steps</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Endpoints Info */}
        <Card className="mt-6 border-0 shadow-lg bg-gray-50">
          <CardHeader>
            <CardTitle className="text-lg">API Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Available Endpoints:</h4>
                <ul className="space-y-1 text-gray-600 font-mono">
                  <li>GET /api/ai-insights/generate</li>
                  <li>GET /api/ai-insights/refresh</li>
                  <li>GET /api/ai-insights/finance</li>
                  <li>GET /api/ai-insights/fitness</li>
                  <li>GET /api/ai-insights/travel</li>
                  <li>GET /api/ai-insights/marketplace</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Query Parameters:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li><code>count</code> - Number of insights (1-10)</li>
                  <li><code>module</code> - Specific module filter</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
