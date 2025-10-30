import { get } from "svelte/store";
import { URLS } from "./shared/urls";
import { sessionTokenStore } from "../stores/sessionTokenStore";

export enum TemplettoApiActions {
  CreateTemplate = "create-template",
  CreatePdf = "create-pdf",
  Logout = "logout",
  getTemplates = "get-templates",
  getOrganizations = "get-organizations",
}

export async function callTemplettoApi({
  action,
  body,
  queryParams,
}: {
  action: TemplettoApiActions;
  body?: Record<string, any> | undefined;
  queryParams?: Record<string, string | number> | undefined;
}) {
  const { url: _url, headers } = getUrlForAction(action);
  const url = new URL(_url);
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.set(key, value.toString());
    });
  }

  const response = await fetch(url, {
    method: body ? "POST" : "GET",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  return response;
}

function getUrlForAction(
  action: TemplettoApiActions,
  body?: Record<string, any> | undefined
): {
  url: string;
  headers: Record<string, string>;
} {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const baseUrl = `${URLS.server}/plugin`;
  switch (action) {
    case TemplettoApiActions.CreateTemplate:
      return {
        url: `${baseUrl}/create-template`,
        headers: { ...headers, ...getAuthHeader() },
      };
    case TemplettoApiActions.CreatePdf:
      return {
        url: `${baseUrl}/create-pdf`,
        headers,
      };
    case TemplettoApiActions.Logout:
      return {
        url: `${baseUrl}/logout`,
        headers,
      };
    case TemplettoApiActions.getTemplates:
      return {
        url: `${baseUrl}/get-templates`,
        headers: { ...headers, ...getAuthHeader() },
      };
    case TemplettoApiActions.getOrganizations:
      return {
        url: `${baseUrl}/get-organizations`,
        headers: { ...headers, ...getAuthHeader() },
      };
  }
}

function getAuthHeader(): Record<string, string> {
  const session = get(sessionTokenStore);
  if (!session) {
    console.error("missing_session_token_when_expected");
    return {};
  }
  return { authorization: `BEARER ${session}` };
}
