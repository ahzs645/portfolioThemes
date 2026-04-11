/**
 * Builds the terminal command map from CV data.
 * Uses jquery.terminal markup syntax: [[b;color;;]text] for formatting.
 */

import { generateBanner } from './banner';

const highlight = (text) => `[[b;rgba(250, 251, 180, 1);;]${text}]`;
const pink = (text) => `[[;rgba(245, 40, 145, 0.99);;]${text}]`;
const italic = (text) => `[[i;rgba(168, 218, 141, 1);;]${text}]`;

function formatEducation(entries = []) {
  return entries
    .map((e) => {
      const degree = e.degree || 'Degree';
      const area = e.area ? ` in ${e.area}` : '';
      const institution = e.institution || '';
      const start = e.start_date ? String(e.start_date).split('-')[0] : '?';
      const end = e.end_date
        ? String(e.end_date).toLowerCase() === 'present'
          ? 'Present'
          : String(e.end_date).split('-')[0]
        : '?';
      return `${highlight(`${degree}${area}`)}\n${institution} | ${start} ~ ${end}`;
    })
    .join('\n\n');
}

function formatExperience(entries = []) {
  return entries
    .map((e) => {
      const position = e.position || 'Role';
      const company = e.company || '';
      const location = e.location ? ` in ${e.location}` : '';
      const start = e.start_date ? String(e.start_date).split('-')[0] : '?';
      const end = e.end_date
        ? String(e.end_date).toLowerCase() === 'present'
          ? 'Present'
          : String(e.end_date).split('-')[0]
        : '?';
      let text = `${highlight(position)}\n${italic(`${company}${location} | ${start} ~ ${end}`)}`;
      if (e.highlights?.length) {
        text += '\n' + e.highlights.map((h) => `  - ${h}`).join('\n');
      }
      return text;
    })
    .join('\n\n');
}

function formatProjects(projects = []) {
  return projects
    .map((p) => {
      let text = highlight(p.name || 'Project');
      if (p.date) {
        text += `\n${italic(p.date)}`;
      }
      if (p.summary) {
        text += `\n${p.summary}`;
      } else if (p.highlights?.length) {
        text += '\n' + p.highlights[0];
      }
      if (p.url) {
        text += `\n${pink(p.url)}`;
      }
      return text;
    })
    .join('\n\n');
}

function formatSocials(socialLinks = {}) {
  return Object.entries(socialLinks)
    .filter(([, v]) => Boolean(v))
    .map(([network, url]) => `- ${network}\t\t ${url}`)
    .join('\n');
}

export function buildCommands(cv, { compact = false } = {}) {
  const username = (cv.name || 'portfolio').toLowerCase().replace(/\s+/g, '');

  return {
    help: function () {
      this.echo(
        `${pink('about')}\t\t     - quick description of myself\n` +
        `${pink('clear')}\t\t     - clears the terminal\n` +
        `${pink('education')}\t\t - my educational background\n` +
        `${pink('experience')}\t\t - my work experience\n` +
        `${pink('projects')}\t\t - my past/ongoing projects\n` +
        `${pink('help')}\t\t     - show all available commands\n` +
        `${pink('socials')}\t\t     - my socials\n` +
        `${pink('contact')}\t\t     - my contact info\n` +
        `${pink('banner')}\t\t     - display the banner`
      );
    },
    about: function () {
      const parts = [];
      if (cv.currentJobTitle) parts.push(highlight(cv.currentJobTitle));
      if (cv.location) parts.push(`Based in ${cv.location}`);
      if (cv.about) parts.push(`\n${cv.about}`);
      this.echo(parts.join('\n') || 'No about information available.');
    },
    banner: function () {
      this.echo(generateBanner(cv, { compact }));
    },
    education: function () {
      const text = formatEducation(cv.education);
      this.echo(text || 'No education data available.');
    },
    experience: function () {
      const text = formatExperience(cv.experience);
      this.echo(text || 'No experience data available.');
    },
    projects: function () {
      const text = formatProjects(cv.projects);
      this.echo(text || 'No projects available.');
    },
    socials: function () {
      const text = formatSocials(cv.socialLinks);
      this.echo(text || 'No socials available.');
    },
    contact: function () {
      const parts = [];
      if (cv.email) parts.push(`Email:\t\t ${cv.email}`);
      if (cv.phone) parts.push(`Phone:\t\t ${cv.phone}`);
      if (cv.location) parts.push(`Location:\t ${cv.location}`);
      if (cv.website) parts.push(`Website:\t ${cv.website}`);
      this.echo(parts.join('\n') || 'No contact information available.');
    },
    email: function () {
      if (cv.email) {
        window.location.href = `mailto:${cv.email}`;
      } else {
        this.echo('No email available.');
      }
    },
  };
}
