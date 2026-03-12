import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send, User, Trash2, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import PageHero from '@/components/PageHero';
import communityHero from '@/assets/community-hero.jpg';

interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
    const channel = supabase
      .channel('posts-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchPosts();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handlePost = async () => {
    if (!newPost.trim() && !imageFile) return;
    if (!user) { toast.error('Please sign in to post'); return; }
    setUploading(true);

    let imageUrl: string | null = null;
    if (imageFile) {
      const ext = imageFile.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('post-images').upload(path, imageFile);
      if (uploadError) { toast.error('Image upload failed'); setUploading(false); return; }
      const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(path);
      imageUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from('posts').insert({ user_id: user.id, content: newPost.trim(), image_url: imageUrl });
    if (error) { toast.error('Failed to post'); }
    else { setNewPost(''); setImageFile(null); toast.success('Post shared!'); }
    setUploading(false);
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

      <Card className="shadow-soft">
        <CardContent className="p-4 space-y-3">
          <Textarea
            placeholder={user ? "Share your farming experience, ask a question..." : "Sign in to post in the community"}
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            rows={3}
            disabled={!user}
          />
          {imageFile && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ImagePlus className="h-4 w-4" />
              <span>{imageFile.name}</span>
              <button onClick={() => setImageFile(null)} className="text-destructive text-xs hover:underline">Remove</button>
            </div>
          )}
          <div className="flex justify-between items-center">
            <input type="file" accept="image/*" ref={fileRef} className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={!user}>
              <ImagePlus className="h-4 w-4 mr-1" /> Image
            </Button>
            <Button onClick={handlePost} disabled={!user || (!newPost.trim() && !imageFile) || uploading} size="sm">
              <Send className="h-4 w-4 mr-1" /> {uploading ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </CardContent>
      </Card>

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
                      <p className="text-sm font-semibold text-foreground">Farmer</p>
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
                {post.content && <p className="text-foreground whitespace-pre-wrap">{post.content}</p>}
                {post.image_url && (
                  <div className="mt-3 rounded-lg overflow-hidden bg-muted">
                    <img src={post.image_url} alt="Post image" className="w-full max-h-96 object-cover" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
