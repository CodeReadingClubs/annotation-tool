# Code Annotation Tool

A tool to annotate code for [code reading clubs](https://code-reading.org).

[Check it out](https://crc-annotations.netlify.app)

## Running

```shell
npm install
npm run dev
```

## Deploying

`npm run build` will build the site in `dist/`. It's currently deployed on
Netlify.

## Missing features

- Add other color schemes
- Handle zoom (currently making the text bigger/smaller results in the markers
  drifting from the text
- Optimize undo/redo (right now it duplicates state. it can be more efficient to
  save diffs. this should only be done if it proves to be a problem for actual
  people)
- Discuss sync needs (sharing with a host? live updates? only line number
  annotations?)
