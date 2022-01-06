import React from "react";
import Copyright from "./Copyright";
import { Link } from "react-router-dom";
import footerStyles from "./FooterStyles";
import { Breadcrumbs } from "@mui/material";

const Footer = () => {
  const classes = footerStyles();
  return (
    <div className={classes.footer}>
      <Breadcrumbs className={classes.footerActions}>
        <Link to="/about" className={classes.link}>
          About VaultBot
        </Link>
        <a
          href="https://github.com/tbrittain/vault-bot/issues/new"
          className={classes.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          Report an issue
        </a>
        <Link to="/changelog" className={classes.link}>
          Changelog (v1.0.0)
        </Link>
      </Breadcrumbs>
      <Copyright />
    </div>
  );
};

export default Footer;
