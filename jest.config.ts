module.exports = {
  displayName: 'kontent-custom-element',

  transform: {
    '^.+\\.[tj]sx?$': [
      '@swc/jest',
      { jsc: { transform: { react: { runtime: 'automatic' } } } },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/kontent-custom-element',
  setupFiles: ['./jest.setup.js'],
  preset: '../../jest.preset.ts',
};
