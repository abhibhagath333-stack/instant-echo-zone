import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, User, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: { full_name: string } | null;
}

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false });
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();

    // Real-time subscription
    const channel = supabase
      .channel('posts-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    if (!user) {
      toast.error('Please sign in to post');
      return;
    }
    const { error } = await supabase.from('posts').insert({ user_id: user.id, content: newPost.trim() });
    if (error) {
      toast.error('Failed to post');
    } else {
      setNewPost('');
      toast.success('Post shared!');
    }
  };

  const handleDelete = async (postId: string) => {
    await supabase.from('posts').delete().eq('id', postId);
    toast.success('Post deleted');
  };

  return (
    <div className="container py-8 space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
          <MessageCircle className="h-8 w-8 text-success" />
          Farmer Community
        </h1>
        <p className="text-muted-foreground mt-1">Share experiences, ask questions & connect with farmers</p>
        <p className="text-xs text-primary mt-1">✨ Posts update in real-time!</p>
      </div>

      {/* New post */}
      <Card className="shadow-soft">
        <CardContent className="p-4 space-y-3">
          <Textarea
            placeholder={user ? "Share your farming experience, ask a question..." : "Sign in to post in the community"}
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            rows={3}
            disabled={!user}
          />
          <div className="flex justify-end">
            <Button onClick={handlePost} disabled={!user || !newPost.trim()} size="sm">
              <Send className="h-4 w-4 mr-1" /> Post
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts feed */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>No posts yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="shadow-soft animate-fade-in">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {post.profiles?.full_name || 'Anonymous Farmer'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  {user?.id === post.user_id && (
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)} className="h-8 w-8">
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  )}
                </div>
                <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
