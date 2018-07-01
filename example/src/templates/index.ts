export default (state: { cssBundles: string; scriptBundles: string }) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>$title</title>
    ${state.cssBundles}
    ${state.scriptBundles}
</head>
<body>
</body>
</html>`;
};
