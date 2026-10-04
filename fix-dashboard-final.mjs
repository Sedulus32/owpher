import fs from "fs";

let d = fs.readFileSync("src/screens/Dashboard.jsx", "utf8");
let lines = d.split("\n");

// Line 131 (index 130): input with className="... focus:border-black />"
// The actual content is: className=\"... focus:border-black />\"
// We need to change it to: className=\"... focus:border-black\" />
if (lines[130] && lines[130].includes('focus:border-black />')) {
  lines[130] = lines[130].replace('focus:border-black />', 'focus:border-black" />');
  console.log("Fixed line 131 (input)");
}

// Line 132 (index 131): textarea with className="... focus:border-black />"
// Need to change to: className="... focus:border-black"></textarea>
if (lines[131] && lines[131].includes('focus:border-black />')) {
  lines[131] = lines[131].replace('focus:border-black />', 'focus:border-black"></textarea>');
  console.log("Fixed line 132 (textarea)");
}

fs.writeFileSync("src/screens/Dashboard.jsx", lines.join("\n"));
console.log("Done");
