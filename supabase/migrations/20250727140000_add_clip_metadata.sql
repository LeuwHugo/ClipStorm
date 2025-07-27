-- Add metadata fields to clip_submissions table
ALTER TABLE clip_submissions 
ADD COLUMN IF NOT EXISTS like_count integer NULL,
ADD COLUMN IF NOT EXISTS comment_count integer NULL,
ADD COLUMN IF NOT EXISTS hashtags text[] NULL,
ADD COLUMN IF NOT EXISTS thumbnail text NULL,
ADD COLUMN IF NOT EXISTS title text NULL,
ADD COLUMN IF NOT EXISTS author text NULL;

-- Add constraints for the new fields
ALTER TABLE clip_submissions 
ADD CONSTRAINT clip_submissions_like_count_positive CHECK (like_count IS NULL OR like_count >= 0),
ADD CONSTRAINT clip_submissions_comment_count_positive CHECK (comment_count IS NULL OR comment_count >= 0);

-- Add comments for documentation
COMMENT ON COLUMN clip_submissions.like_count IS 'Number of likes on the clip';
COMMENT ON COLUMN clip_submissions.comment_count IS 'Number of comments on the clip';
COMMENT ON COLUMN clip_submissions.hashtags IS 'Array of hashtags used in the clip';
COMMENT ON COLUMN clip_submissions.thumbnail IS 'URL to the clip thumbnail image';
COMMENT ON COLUMN clip_submissions.title IS 'Title of the clip';
COMMENT ON COLUMN clip_submissions.author IS 'Author/creator of the clip'; 