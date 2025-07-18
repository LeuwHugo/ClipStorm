@@ .. @@
-- Function to handle new user creation from auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, avatar, role)
  VALUES (
    NEW.id,
    NEW.email,
-    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
+    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
     NEW.raw_user_meta_data->>'avatar_url',
-    'creator'::user_role
+    COALESCE(NEW.raw_user_meta_data->>'role', 'creator')::user_role
   );
   RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;