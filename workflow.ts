
import { Workflow } from './types';

export const MARKETING_VIDEO_WORKFLOW: Workflow = {
  meta: {
    flow_name: 'GenerateMarketingVideo',
    flow_id: 42,
    owner: 'ANDIE',
    description: 'End-to-end pipeline that ingests brand assets and metrics, writes a script, renders an animated promo video, packages it, and ships copy + ROI deck.',
  },
  agents: {
    Lyra: {
      role: 'Data & Systems Specialist',
      verbs: ['TASKSOURCE', 'HANDOFFS'],
    },
    Kara: {
      role: 'Model Dev Lead',
      verbs: ['TASKJOB', 'HANDOVERS'],
    },
    Sophia: {
      role: 'Multimedia Wizard',
      verbs: ['TASKVIEW', 'HANDOVERS'],
    },
    Cecilia: {
      role: 'Cloud & Infra Engineer',
      verbs: ['TASKSCHEDULE', 'HANDOFFS'],
    },
    Stan: {
      role: 'Code Surgeon',
      verbs: ['TASKJOB', 'HANDOVERS'],
    },
    Dude: {
      role: 'Biz Strategist',
      verbs: ['TASKVIEW', 'HANDOVERS'],
    },
    GUAC: {
      role: 'Compliance & Moderation',
      verbs: ['TASKFLOW'],
    },
  },
  schedule: {
    trigger: 'on_demand',
    fallback_cron: '0 9 * * MON',
  },
  steps: [
    {
      id: 10,
      name: 'ingest_brand_assets',
      agent: 'Lyra',
      verb: 'TASKSOURCE',
      input: 'assets/latest.zip',
      output: 'normalized_data.json',
      handover_to: 'Kara',
    },
    {
      id: 20,
      name: 'fine_tune_script_writer',
      agent: 'Kara',
      verb: 'TASKJOB',
      input: 'normalized_data.json',
      output: 'promo_script.md',
      handover_to: 'Sophia',
    },
    {
      id: 30,
      name: 'storyboard_and_render',
      agent: 'Sophia',
      verb: 'TASKVIEW',
      input: 'promo_script.md',
      output: 'video_drafts/',
      handover_to: 'Cecilia',
    },
    {
      id: 40,
      name: 'queue_render_farm',
      agent: 'Cecilia',
      verb: 'TASKSCHEDULE',
      input: 'video_drafts/',
      output: 'final_video.mp4',
      handover_to: 'Stan',
    },
    {
      id: 50,
      name: 'package_and_tag',
      agent: 'Stan',
      verb: 'TASKJOB',
      input: 'final_video.mp4',
      output: 'release_build.zip',
      handover_to: 'Dude',
    },
    {
      id: 60,
      name: 'craft_launch_copy',
      agent: 'Dude',
      verb: 'TASKVIEW',
      input: 'release_build.zip',
      output: 'launch_assets/',
      handover_to: 'ANDIE',
    },
    {
      id: 70,
      name: 'executive_approval',
      agent: 'ANDIE',
      verb: 'SIGNOFF',
      input: 'launch_assets/',
      output: 'published ✅',
    },
  ],
};
