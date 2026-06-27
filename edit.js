const fs = require('fs');

let content = fs.readFileSync('client/public/index.html', 'utf8');

// 1. Remove counter css
content = content.replace(/\s*\/\* Animated counter \*\/[\s\S]*?\.counter \{ transition: all 0\.3s ease; \}/, '');

// 2. Remove bounce arrow
content = content.replace(/\s*<a href="#stats-section"[\s\S]*?<\/a>/, '');

// 3. Remove STATS BAR
content = content.replace(/\s*<!-- STATS BAR -->[\s\S]*?<\/section>/, '');

// 4. Remove TESTIMONIALS
content = content.replace(/\s*<!-- TESTIMONIALS -->[\s\S]*?<\/section>/, '');

// 5. Contact Section adjustments
content = content.replace(/<div class="grid lg:grid-cols-2 gap-16">/, '<div class="max-w-3xl mx-auto">');
content = content.replace(/\s*<!-- Contact Details -->[\s\S]*?<!-- FOOTER -->/, '\n      </div>\n    </div>\n  </section>\n\n  <!-- FOOTER -->');

// 6. Footer Layout adjustments
content = content.replace(/<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">/, '<div class="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">');
content = content.replace(/\s*<!-- Contact -->[\s\S]*?<\/div>(\s*)<\/div>\s*<div class="pt-8 border-t/, '$1</div>\n\n      <div class="pt-8 border-t');

// 7. Remove JS for stats
content = content.replace(/\s*\/\/ ── 5\. ANIMATED COUNTERS ──[\s\S]*?\}\s*\n/, '\n');
content = content.replace(/\s*\/\/ ── 6\. LOAD PUBLIC STATS[\s\S]*?if \(statsSection\) statsObserver\.observe\(statsSection\);\n    \}\n/, '\n');
content = content.replace(/\s*loadPublicStats\(\);/, '');

fs.writeFileSync('client/public/index.html', content, 'utf8');
console.log('Replacements complete');
