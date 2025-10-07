import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { MapPin, Users, Calendar, ExternalLink, Plus } from 'lucide-react';

import DynamicMapComponent from './DynamicMapComponent';

interface Startup {
  id: string;
  name: string;
  description: string;
  location: [number, number];
  founder: string;
  website?: string;
  industry: string;
  stage: 'idea' | 'mvp' | 'growth' | 'scale';
  employees: number;
  founded: string;
  tags: string[];
}

function MapStartups() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newStartupLocation, setNewStartupLocation] = useState<[number, number] | null>(null);
  const mapRef = useRef<any>(null);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'idea':
        return 'bg-gray-500';
      case 'mvp':
        return 'bg-blue-500';
      case 'growth':
        return 'bg-green-500';
      case 'scale':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleMapClick = useCallback((location: [number, number]) => {
    setNewStartupLocation(location);
    setShowCreateForm(true);
  }, []);

  const handleCreateStartup = (startupData: Omit<Startup, 'id' | 'location'>) => {
    if (!newStartupLocation) return;
    
    const newStartup: Startup = {
      ...startupData,
      id: Date.now().toString(),
      location: newStartupLocation,
    };
    
    setStartups(prev => [...prev, newStartup]);
    setShowCreateForm(false);
    setNewStartupLocation(null);
  };

  // Startup Creation Form Component
  const StartupCreationForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      founder: '',
      website: '',
      industry: '',
      stage: 'idea' as const,
      employees: 1,
      founded: new Date().getFullYear().toString(),
      tags: [] as string[],
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleCreateStartup(formData);
      // Reset form
      setFormData({
        name: '',
        description: '',
        founder: '',
        website: '',
        industry: '',
        stage: 'idea',
        employees: 1,
        founded: new Date().getFullYear().toString(),
        tags: [],
      });
    };

    return (
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="w-full max-w-md  overflow-y-auto !z-[99999] mt-8">
          <DialogHeader>
            <DialogTitle>Add Your Startup</DialogTitle>
            <DialogDescription>
              Fill in the details to add your startup to the map.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pb-4">
            <div>
              <label className="text-sm font-medium">Startup Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter startup name"
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your startup"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Founder</label>
              <Input
                value={formData.founder}
                onChange={(e) => setFormData(prev => ({ ...prev, founder: e.target.value }))}
                placeholder="Your name"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Industry</label>
              <Input
                value={formData.industry}
                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                placeholder="e.g., SaaS, HealthTech, FinTech"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Stage</label>
              <Select value={formData.stage} onValueChange={(value: any) => setFormData(prev => ({ ...prev, stage: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idea">Idea Stage</SelectItem>
                  <SelectItem value="mvp">MVP</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                  <SelectItem value="scale">Scale</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Employees</label>
              <Input
                type="number"
                value={formData.employees}
                onChange={(e) => setFormData(prev => ({ ...prev, employees: parseInt(e.target.value) || 1 }))}
                min="1"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Website (optional)</label>
              <Input
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                placeholder="https://yourstartup.com"
                type="url"
              />
            </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Startup
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)} className="flex-1 sm:flex-none">
                    Cancel
                  </Button>
                </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="h-screen w-full bg-background overflow-hidden">
      <div className="h-screen w-full flex">
        {/* Map */}
        <div className="flex-1 h-screen relative z-0">
          <DynamicMapComponent 
            ref={mapRef}
            startups={startups} 
            onStartupSelect={setSelectedStartup}
            onMapClick={handleMapClick}
          />
          
          {/* Location button - outside map container */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (mapRef.current) {
                mapRef.current.centerOnUserLocation();
              }
            }}
            className="absolute top-4 right-4 z-[9999] bg-white hover:bg-gray-50 border border-gray-300 rounded-lg p-2 shadow-lg transition-colors"
            title="Center on my location"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {/* Sidebar */}
        <div className="w-1/3 h-screen bg-card border-l border-border p-4 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">Startup Ecosystem</h2>
              <p className="text-sm text-muted-foreground">
                Click anywhere on the map to add your startup!
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setStartups(startups)}
              >
                All
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setStartups(startups.filter(s => s.stage === 'idea'))}
              >
                Idea
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setStartups(startups.filter(s => s.stage === 'mvp'))}
              >
                MVP
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setStartups(startups.filter(s => s.stage === 'growth'))}
              >
                Growth
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setStartups(startups.filter(s => s.stage === 'scale'))}
              >
                Scale
              </Button>
            </div>

            {/* Startups list */}
            <div className="space-y-3">
              {startups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No startups yet</p>
                  <p className="text-xs">Click on the map to add your first startup!</p>
                </div>
              ) : (
                startups.map((startup) => (
                  <Card
                    key={startup.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedStartup?.id === startup.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedStartup(startup)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-sm font-semibold line-clamp-2">
                          {startup.name}
                        </CardTitle>
                        <Badge className={`text-xs ${getStageColor(startup.stage)}`}>
                          {startup.stage}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="line-clamp-1">{startup.founder}</span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Founded {startup.founded}</span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Users className="h-3 w-3 mr-1" />
                          <span>{startup.employees} employees</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {startup.description}
                        </p>
                        {startup.website && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(startup.website, '_blank');
                            }}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Visit Website
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Startup Creation Form */}
        <StartupCreationForm />
      </div>
    </div>
  );
}

export function MapPage() {
  return (
    <div className="h-screen w-full bg-background overflow-hidden">
      <MapStartups />
    </div>
  );
}
