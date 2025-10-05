import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, Search, Linkedin, Github, Code2, MapPin, Briefcase, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface Profile {
  id: string;
  full_name: string;
  usn: string;
  branch: string;
  passing_year: number;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  current_company: string | null;
  linkedin: string | null;
  github: string | null;
  leetcode: string | null;
}

const Directory = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (search) {
      const filtered = profiles.filter((profile) =>
        profile.full_name.toLowerCase().includes(search.toLowerCase()) ||
        profile.branch.toLowerCase().includes(search.toLowerCase()) ||
        profile.usn.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredProfiles(filtered);
    } else {
      setFilteredProfiles(profiles);
    }
  }, [search, profiles]);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Failed to load alumni');
    } else {
      setProfiles(data || []);
      setFilteredProfiles(data || []);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">
              <span className="text-gradient">Alumni Directory</span>
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search by name, branch, or USN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-input border-border"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i} className="card-gradient border-border/50">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProfiles.length === 0 ? (
          <Card className="card-gradient border-border/50">
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground">No alumni found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProfiles.map((profile) => (
              <Card key={profile.id} className="card-gradient border-border/50 hover-lift">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-16 h-16 rounded-full bg-card-secondary border-2 border-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {profile.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt={profile.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{profile.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{profile.usn}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-primary/20 text-primary rounded text-xs">
                            {profile.branch}
                          </span>
                          <span className="px-2 py-0.5 bg-card-secondary rounded text-xs">
                            {profile.passing_year}
                          </span>
                        </div>
                      </div>
                    </div>

                    {profile.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>
                    )}

                    {(profile.location || profile.current_company) && (
                      <div className="space-y-1 text-sm">
                        {profile.current_company && (
                          <div className="flex items-center text-muted-foreground">
                            <Briefcase className="w-4 h-4 mr-2" />
                            {profile.current_company}
                          </div>
                        )}
                        {profile.location && (
                          <div className="flex items-center text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-2" />
                            {profile.location}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 border-t border-border">
                      {profile.linkedin && (
                        <a
                          href={`https://linkedin.com/in/${profile.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-card-secondary hover:bg-primary/20 rounded-lg transition-colors"
                        >
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                      {profile.github && (
                        <a
                          href={`https://github.com/${profile.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-card-secondary hover:bg-primary/20 rounded-lg transition-colors"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                      {profile.leetcode && (
                        <a
                          href={`https://leetcode.com/${profile.leetcode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-card-secondary hover:bg-primary/20 rounded-lg transition-colors"
                        >
                          <Code2 className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Directory;
