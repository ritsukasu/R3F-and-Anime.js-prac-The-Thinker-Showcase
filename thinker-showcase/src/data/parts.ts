export interface Part {
  id: string;
  label: string;
  title: string;
  description: string;
  note: string;
  textSide: 'left' | 'right';
  focus: [number, number];
  distance: number;
  turn: number;
}

export const parts: Part[] = [
  {
    id: 'head',
    label: 'THE HEAD',
    title: 'The question',
    description:
      "Rodin placed the hand beneath the chin to make thinking physical. The lowered brow and compressed lips turn the face inward, away from the viewer. Look at the knuckles pressed against the mouth: the pose reads as concentration held in check, not as rest.",
    note: 'The furrowed brow and the fist pressed to the lips.',
    textSide: 'left',
    focus: [0.45, 0.78],
    distance: 2.35,
    turn: 0.2,
  },
  {
    id: 'torso',
    label: 'THE TORSO',
    title: 'Held tension',
    description:
      'The torso is powerful but not relaxed. Rodin gave the back and shoulders the weight of an athlete, a reminder that thought can be as strenuous as action. The spine curls forward and every muscle is modeled as if under load, which is why the stillness never feels passive.',
    note: 'The curve of the spine and the bunched shoulder.',
    textSide: 'right',
    focus: [0.58, 0.66],
    distance: 2.3,
    turn: 2.1,
  },
  {
    id: 'arms',
    label: 'THE ARMS',
    title: 'A body that listens',
    description:
      'One arm anchors the head while the other follows the thigh. Their geometry creates a closed loop: the body folds in on itself to make space for an idea. The elbow braces on the opposite knee and the free hand curls over the leg, so the whole upper body leans against itself.',
    note: 'The braced elbow and the hand gripping the leg.',
    textSide: 'left',
    focus: [0.5, 0.64],
    distance: 2.05,
    turn: 4.15,
  },
  {
    id: 'base',
    label: 'THE BASE',
    title: 'Grounded',
    description:
      'The low plinth gives the figure a place to return to. It is intentionally simple: an anchor for a sculpture that is otherwise all internal motion. The rough, unfinished rock keeps the surface alive, and the gripping toes carry the figure\'s tension down into the ground.',
    note: 'The gripping toes and the rough rock surface.',
    textSide: 'right',
    focus: [0.45, 0.18],
    distance: 2.4,
    turn: 6.28,
  },
];