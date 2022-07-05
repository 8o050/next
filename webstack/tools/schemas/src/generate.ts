/**
 * Copyright (c) SAGE3 Development Team
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 *
 */
import * as path from 'path';
import * as fs from 'fs';

// Convert Zod to JSON Schema
import zodToJsonSchema from 'zod-to-json-schema';
// Custom version of 'schema to md', from JSONSchemaMarkdown
import { SAGE3Doc } from './sage3doc';

// Import SAGE3 schema
import { SBSchema } from '../../../libs/shared/src/lib/types/schemas';

// Read the file containing all the apps
const text = fs.readFileSync(path.join(__dirname, '../../../libs/applications/src/lib/apps.json'));
const listApps = JSON.parse(text.toString());
console.log('List apps:', listApps.length, ' apps');

listApps.forEach((elt: any) => {
  const appName = elt;
  // load one app
  import(`../../../libs/applications/src/lib/apps/${appName}/`)
    .then((ap) => {
      if (ap.schema) {
        const app = ap.name;
        console.log('App loaded>', app);

        // TS type for sagebase
        const SAGEschema = SBSchema.extend({ data: ap.schema });
        const jsonSchema = zodToJsonSchema(SAGEschema, {
          name: app,
          target: 'jsonSchema7',
        });

        const folder = 'output';
        fs.writeFile(path.join(folder, app + '-schema.json'), JSON.stringify(jsonSchema, null, 2), (err) => {
          if (err) throw err;
          console.log('Spec saved:', app + '-schema.json');

          // create an instance of JSONSchemaMarkdown
          const genmd = new SAGE3Doc();
          // load the schema
          genmd.load(jsonSchema);
          // generate the markdown
          fs.writeFile(path.join(folder, app + '.md'), genmd.generate(), (err) => {
            if (err) throw err;
            console.log('Doc saved: ' + app + '.md');
          });
        });
      } else {
        console.log('Error> loading', appName, ': no schema');
      }
    })
    .catch((err) => {
      console.log('Error> loading', appName, err);
    });
});
