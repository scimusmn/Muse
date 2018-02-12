var obtains = [
  'µ/google/drive.js',
  'µ/google/sheets.js',
  'µ/google/gmail.js',
];

obtain(obtains, (drive, sheets, gmail)=> {
  console.log(drive);
  exports.drive = drive;
  exports.sheets = sheets;
  exports.gmail = gmail;
});
