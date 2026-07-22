USE SafeX;
GO

MERGE dbo.Categories AS T
USING (VALUES
    ('Mathematics','mathematics'),
    ('Science','science'),
    ('Technology','technology'),
    ('Language Arts','language-arts'),
    ('History','history'),
    ('Arts & Crafts','arts-crafts'),
    ('Music','music'),
    ('Physical Education','physical-education'),
    ('Life Skills','life-skills'),
    ('Coding','coding')
) AS S(Name, Slug)
ON T.Slug = S.Slug
WHEN NOT MATCHED THEN
    INSERT (Name, Slug) VALUES (S.Name, S.Slug);
GO
PRINT 'Categories seeded.';
