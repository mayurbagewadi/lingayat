-- Demo Data for Lingayat Matrimony
-- Includes:
-- 1. Admin User (inserted into auth.users handled by Supabase usually, but we can simulate profiles)
-- 2. Active Premium Grooms/Brides
-- 3. Active Free Grooms/Brides
-- 4. Pending Profiles

-- Note: In a real scenario, we cannot insert into auth.users directly via SQL Editor easily without admin API. 
-- So we will insert into public.profiles depending on existing auth users using a best-effort approach or just populate profiles 
-- that might be "orphan" (no login) but visible in 'Browse' section.

INSERT INTO public.profiles 
(id, full_name, dob, created_for, sub_caste, gender, education, location, mobile, email, status, subscription_status, photo_1_file_id)
VALUES 
-- 1. Premium Groom (Active)
(uuid_generate_v4(), 'Basavaraj Patil', '1992-05-15', 'Self', 'Jangama', 'Male', 'MBA', 'Hubli', '9800000001', 'basava@demo.com', 'active', 'premium', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop'),

-- 2. Premium Bride (Active)
(uuid_generate_v4(), 'Sneha Shettar', '1995-08-20', 'Parent', 'Panchamasali', 'Female', 'BE Computer Science', 'Bangalore', '9800000002', 'sneha@demo.com', 'active', 'premium', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop'),

-- 3. Free Groom (Active)
(uuid_generate_v4(), 'Vinay Kulkarni', '1990-01-10', 'Sibling', 'Banajiga', 'Male', 'B.Com', 'Belgaum', '9800000003', 'vinay@demo.com', 'active', 'free', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop'),

-- 4. Free Bride (Active)
(uuid_generate_v4(), 'Pooja Meti', '1996-11-05', 'Self', 'Gowda', 'Female', 'M.Tech', 'Davangere', '9800000004', 'pooja@demo.com', 'active', 'free', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop'),

-- 5. Pending Profile (Should not be visible in Browse)
(uuid_generate_v4(), 'Rahul H', '1998-03-25', 'Self', 'Nolamba', 'Male', 'BCA', 'Mysore', '9800000005', 'rahul@demo.com', 'pending_approval', 'free', null),

-- 6. Rejected Profile
(uuid_generate_v4(), 'Fake User', '2000-01-01', 'Self', 'Other', 'Male', 'None', 'Unknown', '9800000006', 'fake@demo.com', 'rejected', 'free', null),

-- 7. Premium Bride 2
(uuid_generate_v4(), 'Aishwarya B', '1994-07-12', 'Parent', 'Jangama', 'Female', 'MBBS', 'Gulbarga', '9800000007', 'aish@demo.com', 'active', 'premium', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&auto=format&fit=crop'),

-- 8. Groom 3
(uuid_generate_v4(), 'Karthik S', '1991-09-30', 'Self', 'Panchamasali', 'Male', 'Architecture', 'Pune', '9800000008', 'karthik@demo.com', 'active', 'free', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop');

-- Add mock payments
INSERT INTO public.payments (profile_id, amount, transaction_id, payment_method, status, created_at)
SELECT id, 2999, 'TXN_' || substring(cast(id as text), 1, 8), 'razorpay', 'completed', now()
FROM public.profiles 
WHERE subscription_status = 'premium';
