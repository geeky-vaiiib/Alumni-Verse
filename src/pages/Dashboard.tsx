import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { LogOut, Plus, Heart, MessageCircle, User, Sparkles, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface Profile {
  id: string;
  full_name: string;
  usn: string;
  branch: string;
  passing_year: number;
  avatar_url: string | null;
  bio: string | null;
  linkedin: string | null;
  github: string | null;
  leetcode: string | null;
}

interface Post {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  user_id: string;
  profiles: Profile;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchProfile();
    fetchPosts();
    subscribeToRealtime();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      if (error.code === 'PGRST116') {
        navigate('/profile-setup');
      }
    } else {
      setProfile(data);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles (*)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  const subscribeToRealtime = () => {
    const channel = supabase
      .channel('posts-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() || !user) return;

    setPosting(true);
    const { error } = await supabase.from('posts').insert({
      content: newPost,
      user_id: user.id,
    });

    if (error) {
      toast.error('Failed to create post');
    } else {
      toast.success('Post created!');
      setNewPost('');
    }
    setPosting(false);
  };

  const handleLikePost = async (postId: string) => {
    if (!user) return;

    const { error } = await supabase.from('post_likes').insert({
      post_id: postId,
      user_id: user.id,
    });

    if (error) {
      if (error.code === '23505') {
        // Already liked, unlike it
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      }
    }

    fetchPosts();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">
              <span className="text-gradient">AlumniVerse</span>
            </h1>
          </div>
          <Button onClick={signOut} variant="ghost" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="card-gradient border-border/50 sticky top-24">
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-24 h-24 rounded-full bg-card-secondary border-4 border-primary/20 flex items-center justify-center overflow-hidden">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{profile?.full_name || 'Loading...'}</h3>
                    <p className="text-sm text-muted-foreground">{profile?.usn}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-center">
                    <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs">
                      {profile?.branch}
                    </span>
                    <span className="px-3 py-1 bg-card-secondary rounded-full text-xs">
                      Class of {profile?.passing_year}
                    </span>
                  </div>
                  {profile?.bio && (
                    <p className="text-sm text-muted-foreground">{profile.bio}</p>
                  )}
                </div>

                <div className="pt-4 border-t border-border space-y-2">
                  <Button variant="outline" className="w-full" onClick={() => navigate('/directory')}>
                    <Users className="w-4 h-4 mr-2" />
                    Alumni Directory
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post */}
            <Card className="card-gradient border-border/50">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Textarea
                    placeholder="Share something with your alumni network..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="bg-input border-border min-h-[100px]"
                  />
                  <Button
                    onClick={handleCreatePost}
                    disabled={!newPost.trim() || posting}
                    className="glow-effect"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Post
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Posts Feed */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                Latest Updates
              </h2>

              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <Card key={i} className="card-gradient border-border/50">
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-start space-x-3">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))
              ) : posts.length === 0 ? (
                <Card className="card-gradient border-border/50">
                  <CardContent className="pt-6 text-center py-12">
                    <p className="text-muted-foreground">
                      No posts yet. Be the first to share something!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <Card key={post.id} className="card-gradient border-border/50 hover-lift">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 rounded-full bg-card-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                            {post.profiles.avatar_url ? (
                              <img
                                src={post.profiles.avatar_url}
                                alt={post.profiles.full_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold">{post.profiles.full_name}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {post.profiles.branch} • {post.profiles.passing_year}
                                </p>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(post.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-foreground">{post.content}</p>

                        <div className="flex items-center space-x-4 pt-2 border-t border-border">
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Heart className="w-4 h-4" />
                            <span>{post.likes_count}</span>
                          </button>
                          <button className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.comments_count}</span>
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
