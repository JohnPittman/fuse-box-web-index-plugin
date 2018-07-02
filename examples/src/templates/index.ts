export default (state: { css: string; script: string; title: string }) => {
    return `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">

    <title>${state.title}</title>
    ${state.css}
    ${state.script}
</head>

<body>
</body>

</html>`;
};
