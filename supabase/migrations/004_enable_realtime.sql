-- Migration: Enable Realtime for profile updates
-- Purpose: Allow clients to subscribe to real-time profile changes

-- Enable realtime for profiles table (if not already enabled)
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Enable realtime for posts table (likely already enabled, but ensuring)
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;

-- Enable realtime for post_likes
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_likes;

-- Enable realtime for connections
ALTER PUBLICATION supabase_realtime ADD TABLE public.connections;

-- Comment for documentation
COMMENT ON TABLE public.profiles IS 'Alumni profiles with real-time sync enabled for instant updates across clients';
