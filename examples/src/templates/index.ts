export default (state: { cssBundles: string; scriptBundles: string; title: string }) => {
    return `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">

    <title>${state.title}</title>
    ${state.scriptBundles}
    ${state.cssBundles}
</head>

<body>
</body>

</html>`;
};
