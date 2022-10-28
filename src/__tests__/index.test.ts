import {
  createStyleString,
  createTextData,
  createTextStyleObject,
} from '../utils';

describe('Style String Generator', () => {
  test('Should create a style string based on HTMLObject', () => {
    const DATA_MOCK = {
      value: 'Uthan',
      bold: true,
      italic: true,
    };

    expect(createStyleString(DATA_MOCK, 16, 'Arial')).toBe(
      'bold italic 16px Arial'
    );
  });
});

describe('Create Object from HTML', () => {
  test('Should create a object from a plain HTML', () => {
    const DATA_MOCK = '<b>Giovanni Giorno</b>';
    const EXPECTED_OUTPUT = [
      {
        node: 'element',
        tag: 'b',
        child: [
          {
            node: 'text',
            text: 'Giovanni Giorno',
          },
        ],
      },
    ];

    expect(createTextData(DATA_MOCK)).toStrictEqual(EXPECTED_OUTPUT);
  });
});

describe('Create Text Style Object', () => {
  test('Should return a script readable object from HTML', () => {
    const MOCK_DATA = '<b>Giovanni Giorno</b>';
    const EXPECTED_OUTPUT = [
      {
        value: 'Giovanni',
        bold: true,
      },
      {
        value: 'Giorno',
        bold: true,
      },
    ];

    expect(createTextStyleObject(MOCK_DATA)).toStrictEqual(EXPECTED_OUTPUT);
  });
});
