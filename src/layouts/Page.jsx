import PageHeader from "./PageHeader.jsx";
import PageFooter from "./PageFooter.jsx";
import "./page.css";

export default function Page({
  title,
  eyebrow,
  description,
  actions,
  footer,
  children,
}) {
  return (
    <>
      <PageHeader
        title={title}
        eyebrow={eyebrow}
        description={description}
        actions={actions}
      />
      {children}
      <PageFooter>{footer}</PageFooter>
    </>
  );
}
