import React from 'react';
import styled from 'styled-components';

const Section = styled.section`
  min-height: 80vh;
  padding: 6rem 2rem;
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 4rem 1.5rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #06b6d4;
  margin-bottom: 3rem;
`;

const SkillsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1.5rem;
`;

const SkillCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 1rem;
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #06b6d4;
    transform: translateY(-2px);
  }
`;

const SkillIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  color: #06b6d4;

  i {
    font-size: 2.5rem;
  }
`;

const SkillName = styled.span`
  font-size: 0.8rem;
  color: #a1a1aa;
  text-align: center;
`;

const SkillCategory = styled.div`
  margin-bottom: 3rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const CategoryTitle = styled.h3`
  font-size: 1rem;
  color: #fff;
  margin-bottom: 1.5rem;
  font-weight: 500;
`;

// Map skill names to devicon classes
function getDeviconClass(skillName) {
  const name = (skillName || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  const iconMap = {
    javascript: 'devicon-javascript-plain',
    typescript: 'devicon-typescript-plain',
    react: 'devicon-react-original',
    reactnative: 'devicon-react-original',
    nodejs: 'devicon-nodejs-plain',
    node: 'devicon-nodejs-plain',
    python: 'devicon-python-plain',
    java: 'devicon-java-plain',
    csharp: 'devicon-csharp-plain',
    c: 'devicon-c-plain',
    cpp: 'devicon-cplusplus-plain',
    go: 'devicon-go-plain',
    rust: 'devicon-rust-plain',
    ruby: 'devicon-ruby-plain',
    php: 'devicon-php-plain',
    swift: 'devicon-swift-plain',
    kotlin: 'devicon-kotlin-plain',
    html: 'devicon-html5-plain',
    html5: 'devicon-html5-plain',
    css: 'devicon-css3-plain',
    css3: 'devicon-css3-plain',
    sass: 'devicon-sass-original',
    tailwind: 'devicon-tailwindcss-plain',
    tailwindcss: 'devicon-tailwindcss-plain',
    bootstrap: 'devicon-bootstrap-plain',
    vue: 'devicon-vuejs-plain',
    vuejs: 'devicon-vuejs-plain',
    angular: 'devicon-angularjs-plain',
    svelte: 'devicon-svelte-plain',
    nextjs: 'devicon-nextjs-plain',
    next: 'devicon-nextjs-plain',
    nuxt: 'devicon-nuxtjs-plain',
    express: 'devicon-express-original',
    fastapi: 'devicon-fastapi-plain',
    django: 'devicon-django-plain',
    flask: 'devicon-flask-original',
    rails: 'devicon-rails-plain',
    spring: 'devicon-spring-plain',
    dotnet: 'devicon-dot-net-plain',
    graphql: 'devicon-graphql-plain',
    mongodb: 'devicon-mongodb-plain',
    postgresql: 'devicon-postgresql-plain',
    postgres: 'devicon-postgresql-plain',
    mysql: 'devicon-mysql-plain',
    redis: 'devicon-redis-plain',
    firebase: 'devicon-firebase-plain',
    aws: 'devicon-amazonwebservices-original',
    gcp: 'devicon-googlecloud-plain',
    azure: 'devicon-azure-plain',
    docker: 'devicon-docker-plain',
    kubernetes: 'devicon-kubernetes-plain',
    git: 'devicon-git-plain',
    github: 'devicon-github-original',
    gitlab: 'devicon-gitlab-plain',
    linux: 'devicon-linux-plain',
    bash: 'devicon-bash-plain',
    vim: 'devicon-vim-plain',
    vscode: 'devicon-vscode-plain',
    figma: 'devicon-figma-plain',
    webpack: 'devicon-webpack-plain',
    vite: 'devicon-vitejs-plain',
    npm: 'devicon-npm-original-wordmark',
    yarn: 'devicon-yarn-plain',
    jest: 'devicon-jest-plain',
    tensorflow: 'devicon-tensorflow-original',
    pytorch: 'devicon-pytorch-original',
    pandas: 'devicon-pandas-original',
    numpy: 'devicon-numpy-original',
  };

  return iconMap[name] || null;
}

function isArchived(entry) {
  return Array.isArray(entry?.tags) && entry.tags.includes('archived');
}

export default function Technologies({ skills = [] }) {
  // Handle both array of skills and categorized skills
  const filteredSkills = skills.filter(s => !isArchived(s));

  if (filteredSkills.length === 0) {
    return null;
  }

  // Check if skills are categorized (have keywords/items arrays)
  const isCategorized = filteredSkills.some(s =>
    Array.isArray(s.keywords) || Array.isArray(s.items) || Array.isArray(s.skills)
  );

  if (isCategorized) {
    return (
      <Section id="skills">
        <SectionTitle>Technologies</SectionTitle>
        {filteredSkills.map((category, idx) => {
          const items = category.keywords || category.items || category.skills || [];
          if (items.length === 0) return null;

          return (
            <SkillCategory key={idx}>
              <CategoryTitle>{category.name || category.category || 'Skills'}</CategoryTitle>
              <SkillsGrid>
                {items.map((skill, index) => {
                  const skillName = typeof skill === 'string' ? skill : skill.name;
                  const iconClass = getDeviconClass(skillName);

                  return (
                    <SkillCard key={index}>
                      <SkillIcon>
                        {iconClass ? (
                          <i className={iconClass}></i>
                        ) : (
                          <span style={{ fontSize: '1.5rem' }}>💻</span>
                        )}
                      </SkillIcon>
                      <SkillName>{skillName}</SkillName>
                    </SkillCard>
                  );
                })}
              </SkillsGrid>
            </SkillCategory>
          );
        })}
      </Section>
    );
  }

  // Flat list of skills
  const allSkills = filteredSkills.map(s => typeof s === 'string' ? s : s.name || s.skill);

  return (
    <Section id="skills">
      <SectionTitle>Technologies</SectionTitle>
      <SkillsGrid>
        {allSkills.map((skill, index) => {
          const iconClass = getDeviconClass(skill);

          return (
            <SkillCard key={index}>
              <SkillIcon>
                {iconClass ? (
                  <i className={iconClass}></i>
                ) : (
                  <span style={{ fontSize: '1.5rem' }}>💻</span>
                )}
              </SkillIcon>
              <SkillName>{skill}</SkillName>
            </SkillCard>
          );
        })}
      </SkillsGrid>
    </Section>
  );
}
