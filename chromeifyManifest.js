#!/usr/bin/env node
/* eslint-env node */

import fs from "fs";

import { parseArgs, transformStream } from "./chromeifyManifest.impl.js";

const [infile, outfile] = parseArgs(process.argv.slice(2));
const instream = (infile === "-") ? process.stdin : fs.createReadStream(infile);
const outstream = (outfile === "-") ? process.stdout : fs.createWriteStream(outfile);

transformStream(instream, outstream);
