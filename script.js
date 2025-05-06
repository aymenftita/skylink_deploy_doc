document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');
    
    mobileMenuBtn.addEventListener('click', function() {
        sidebar.classList.toggle('open');
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Close mobile menu if open
                sidebar.classList.remove('open');
                
                window.scrollTo({
                    top: targetElement.offsetTop - 20,
                    behavior: 'smooth'
                });
                
                // Update active state in sidebar
                document.querySelectorAll('.sidebar-nav li').forEach(li => {
                    li.classList.remove('active');
                });
                
                this.parentElement.classList.add('active');
            }
        });
    });

    // Highlight current section in sidebar while scrolling
    const sections = document.querySelectorAll('.doc-section');
    const navItems = document.querySelectorAll('.sidebar-nav li');
    
    function highlightNavItem() {
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 200) {
                currentSection = '#' + section.getAttribute('id');
            }
        });
        
        navItems.forEach(item => {
            item.classList.remove('active');
            const link = item.querySelector('a');
            if (link && link.getAttribute('href') === currentSection) {
                item.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', highlightNavItem);
    highlightNavItem(); // Run once on page load

    // Copy code blocks functionality
    document.querySelectorAll('pre').forEach(pre => {
        const button = document.createElement('button');
        button.className = 'copy-btn';
        button.innerHTML = '<i class="far fa-copy"></i>';
        button.title = 'Copy to clipboard';
        
        button.addEventListener('click', function() {
            const code = pre.querySelector('code').innerText;
            navigator.clipboard.writeText(code).then(() => {
                button.innerHTML = '<i class="fas fa-check"></i>';
                button.title = 'Copied!';
                setTimeout(() => {
                    button.innerHTML = '<i class="far fa-copy"></i>';
                    button.title = 'Copy to clipboard';
                }, 2000);
            });
        });
        
        pre.style.position = 'relative';
        pre.appendChild(button);
    });

    // Next/previous button functionality (simplified example)
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.prev-btn');
    
    nextBtn.addEventListener('click', function() {
        const activeItem = document.querySelector('.sidebar-nav li.active');
        if (activeItem && activeItem.nextElementSibling) {
            activeItem.nextElementSibling.querySelector('a').click();
        }
    });
    
    prevBtn.addEventListener('click', function() {
        const activeItem = document.querySelector('.sidebar-nav li.active');
        if (activeItem && activeItem.previousElementSibling) {
            activeItem.previousElementSibling.querySelector('a').click();
        }
    });

    document.querySelectorAll('pre code').forEach((block) => {
        const lines = block.innerHTML.split('\n');
        if (lines.length > 1) {
            let html = '';
            lines.forEach((line, i) => {
                if (line.trim() === '') return;
                html += `<span class="line-number">${i + 1}</span>${line}\n`;
            });
            block.innerHTML = html;
        }
    });
});

// PDF Export Functionality
document.getElementById('pdfExportBtn').addEventListener('click', exportToPDF);

function exportToPDF() {
    // Show loading state
    const btn = document.getElementById('pdfExportBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
    btn.disabled = true;

    // Get the element to export
    const element = document.querySelector('.documentation-content');
    
    // Options for pdf generation
    const opt = {
        margin: 10,
        filename: 'documentation.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            logging: true,
            useCORS: true,
            allowTaint: true
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // Generate the PDF
    html2pdf().set(opt).from(element).toPdf().get('pdf').then(function(pdf) {
        // Add footer
        const totalPages = pdf.internal.getNumberOfPages();
        
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(10);
            pdf.setTextColor(150);
            pdf.text(`Page ${i} of ${totalPages}`, 
                    pdf.internal.pageSize.getWidth() - 30,
                    pdf.internal.pageSize.getHeight() - 10);
        }
    }).save().finally(function() {
        // Restore button state
        btn.innerHTML = originalText;
        btn.disabled = false;
    });
}


document.getElementById('docxExportBtn').addEventListener('click', exportToDocx);

async function exportToDocx() {
    const btn = document.getElementById('docxExportBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    btn.disabled = true;

    try {
        // Get the main content element
        const element = document.querySelector('.documentation-content');
        
        // Create a new document
        const doc = new docx.Document({
            styles: {
                paragraphStyles: [{
                    id: "Normal",
                    name: "Normal",
                    run: {
                        size: 24, // 12pt
                        font: "Calibri"
                    },
                    paragraph: {
                        spacing: {
                            line: 276, // 1.15 line spacing
                        }
                    }
                }]
            },
            sections: [{
                properties: {},
                children: await htmlToDocx(element)
            }]
        });

        // Generate the DOCX file
        docx.Packer.toBlob(doc).then(blob => {
            saveAs(blob, "documentation.docx");
        });
    } catch (error) {
        console.error("Error generating DOCX:", error);
        alert("Error generating document. Please try again.");
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}
/********************************************************* */
document.getElementById('docxExportBtn').addEventListener('click', exportToDocx);

async function exportToDocx() {
    const btn = document.getElementById('docxExportBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    btn.disabled = true;

    try {
        // Get the main content element
        const element = document.querySelector('.documentation-content');
        
        // Create a new document
        const doc = new docx.Document({
            styles: {
                paragraphStyles: [{
                    id: "Normal",
                    name: "Normal",
                    run: {
                        size: 24, // 12pt
                        font: "Calibri"
                    },
                    paragraph: {
                        spacing: {
                            line: 276, // 1.15 line spacing
                        }
                    }
                }]
            },
            sections: [{
                properties: {},
                children: await htmlToDocx(element)
            }]
        });

        // Generate the DOCX file
        docx.Packer.toBlob(doc).then(blob => {
            saveAs(blob, "documentation.docx");
        });
    } catch (error) {
        console.error("Error generating DOCX:", error);
        alert("Error generating document. Please try again.");
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

async function htmlToDocx(element) {
    const children = [];
    const { Paragraph, TextRun, HeadingLevel } = docx;
    
    // Process all child nodes
    for (const node of element.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
            // Handle text nodes
            const text = node.textContent.trim();
            if (text) {
                children.push(new Paragraph({
                    children: [new TextRun(text)],
                    style: "Normal"
                }));
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Handle element nodes
            const tagName = node.tagName.toLowerCase();
            const textContent = node.textContent.trim();
            
            if (!textContent) continue;
            
            switch (tagName) {
                case 'h1':
                    children.push(new Paragraph({
                        text: textContent,
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 400, after: 120 }
                    }));
                    break;
                    
                case 'h2':
                    children.push(new Paragraph({
                        text: textContent,
                        heading: HeadingLevel.HEADING_2,
                        spacing: { before: 300, after: 100 }
                    }));
                    break;
                    
                case 'h3':
                    children.push(new Paragraph({
                        text: textContent,
                        heading: HeadingLevel.HEADING_3,
                        spacing: { before: 200, after: 80 }
                    }));
                    break;
                    
                case 'p':
                    children.push(new Paragraph({
                        children: [new TextRun(textContent)],
                        style: "Normal"
                    }));
                    break;
                    
                case 'ul':
                case 'ol':
                    const items = node.querySelectorAll('li');
                    for (const item of items) {
                        if (item.textContent.trim()) {
                            children.push(new Paragraph({
                                text: item.textContent.trim(),
                                bullet: { level: 0 },
                                style: "Normal"
                            }));
                        }
                    }
                    children.push(new Paragraph({ text: "" }));
                    break;
                    
                case 'pre':
                case 'code':
                    children.push(new Paragraph({
                        text: textContent,
                        style: "Normal",
                        run: { font: "Courier New" }
                    }));
                    children.push(new Paragraph({ text: "" }));
                    break;
                    
                case 'div':
                case 'section':
                    // Recursively process child elements
                    const childElements = await htmlToDocx(node);
                    children.push(...childElements);
                    break;
            }
        }
    }
    
    return children;
}


