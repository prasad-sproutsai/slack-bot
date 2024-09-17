// import { jsonSchema } from './convertSchema';
// import Ajv from 'ajv';
// import addFormats from 'ajv-formats';

// const ajv = new Ajv();
// addFormats(ajv); // Add this line to include formats

// const validate = ajv.compile(jsonSchema);

// export function validateUser(data: unknown) {
//   const valid = validate(data);
//   if (!valid) {
//     console.error('Validation failed:', validate.errors);
//     return false;
//   }
//   console.log('Validation successful');
//   return true;
// }