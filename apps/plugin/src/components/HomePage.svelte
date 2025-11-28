<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import BaseLayout from "./BaseLayout.svelte";
  import {
    callTemplettoApi,
    TemplettoApiActions,
  } from "../lib/utils/plugin-api-endpoint";
  import OrgSelectorItem from "./sidebar/OrgSelectorItem.svelte";
  import LogoutButton from "./LogoutButton.svelte";
  import TemplateListItem from "./sidebar/TemplateListItem.svelte";
  import TemplatesView from "./views/TemplatesView.svelte";
  import TemplatePreviewView from "./views/TemplatePreviewView.svelte";
  import SidebarItem from "./sidebar/SidebarItem.svelte";
  import PreviewOptions from "./sidebar/PreviewOptions.svelte";
  import { MainThreadMsg, UiMsg } from "../lib/utils/shared/messages";
  import type { AppNode } from "../types";
  import { sendToMainThread } from "../lib/utils/messages";
  import { getHtmlDocumentFromAppNode } from "../app-node-to-hscript";
  import { onClickDownloadTemplate } from "../lib/utils/download";
  import { isEqual } from "lodash";
  import GetHelpButton from "./GetHelpButton.svelte";
  import {
    getMessageEventListener,
    type AppMessageEvent,
  } from "../lib/utils/window-ev-listener-utils";
  import { replaceBgImgStyleUrlsWithBase64 } from "../lib/utils/html-string-utils";
  import About from "./sidebar/About.svelte";
  import { sessionTokenStore } from "../lib/stores/sessionTokenStore";
  import LoginButton from "./LoginButton.svelte";

  const isTeamSelectorFetureEnabled = false;

  let organizations: { id: string; name: string }[] | null | undefined =
    undefined;
  let selectedOrgId: string | undefined | null = undefined;
  async function loadOrganizations(token: string | null | undefined) {
    organizations = undefined;
    selectedOrgId = undefined;
    if (!sessionTokenStore) {
      organizations = null;
      selectedOrgId = null;
      return;
    }
    try {
      const response = await callTemplettoApi({
        action: TemplettoApiActions.getOrganizations,
      });

      if (!response.ok) {
        throw new Error("failed_to_get_organizations");
      }
      const _organizations = await response.json();
      // TODO: parse response with zod
      if (!_organizations || _organizations.length === 0) {
        throw new Error("no_organizations");
      }
      organizations = _organizations;
      selectedOrgId = _organizations[0].id;
    } catch (error) {
      console.error("failed_to_load_organizations", error);
      organizations = null;
      selectedOrgId = null;
    }
  }

  let rootNodeInfo:
    | null
    | undefined
    | { rootNode: AppNode; config: { width: number; height: number } } = null;
  let selectedFrameId: string | undefined = undefined;
  let frameSelectOptions: { id: string; name: string }[] | undefined;
  let imgHashToBlob: Record<string, Blob> = {};
  let htmlBuildLogs: {
    severity: "error" | "warning" | "info";
    message: string;
  }[] = [];

  function onMessage(event: AppMessageEvent) {
    const { type, data } = event.data.pluginMessage;
    switch (type) {
      case MainThreadMsg.PostFrameNodes:
        if (!data) {
          rootNodeInfo = null;
          return;
        }
        rootNodeInfo = data;
        break;
      case MainThreadMsg.PostFrameInfosForSelector:
        const newFrames = data.frames as { id: string; name: string }[];
        if (isEqual(newFrames, frameSelectOptions)) {
          return;
        }
        frameSelectOptions = newFrames;
        if (!selectedFrameId && frameSelectOptions.length > 0) {
          selectedFrameId = frameSelectOptions[0].id;
        }
        break;
      case MainThreadMsg.PostImageInfo:
        const { hash, bytes } = data;
        imgHashToBlob = {
          ...imgHashToBlob,
          [hash]: new Blob([bytes], { type: "image/png" }),
        };
        break;
      case MainThreadMsg.PostHtmlBuildMessage:
        htmlBuildLogs = [...htmlBuildLogs, data];
        break;
    }
  }
  const unsub = getMessageEventListener(onMessage);

  let htmlString: string | null | undefined = undefined;
  function onTemplateInfoChange(appNode: null | undefined | AppNode) {
    if (!appNode) {
      htmlString = appNode === null ? null : undefined;
      return;
    }

    htmlString = getHtmlDocumentFromAppNode(appNode).outerHTML;
  }
  $: onTemplateInfoChange(rootNodeInfo && rootNodeInfo.rootNode);
  $: if (rootNodeInfo === undefined) {
    htmlBuildLogs = [];
  }

  async function onClickDownloadHtml(htmlStringInput: string): Promise<void> {
    const htmlResult = await replaceBgImgStyleUrlsWithBase64({
      htmlStringInput,
      imgHashToBlob,
    });
    if (!htmlResult) {
      console.error("failed_to_replace_bg_img_style_urls_with_base64");
      return;
    }
    onClickDownloadTemplate({ htmlString: htmlResult });
  }

  $: loadOrganizations($sessionTokenStore);

  onMount(async () => {
    sendToMainThread(UiMsg.RequestSelectableFrames, null);
  });

  onDestroy(() => {
    unsub();
  });

  let view: View = "preview";
  const views = ["templates", "preview"] as const;
  type View = (typeof views)[number];
</script>

<BaseLayout>
  <div slot="sidebar" class="sidebar">
    <div class="panel">
      <PreviewOptions
        onSelectSection={() => (view = "preview")}
        isDownloadEnabled={!!htmlString}
        onClickDownload={async () =>
          await onClickDownloadHtml(htmlString ?? "")}
        onSelectFrame={(frameId) => {
          selectedFrameId = frameId;
        }}
        frameInfos={frameSelectOptions}
        {selectedFrameId}
        onClickOnSelectElement={() => {
          sendToMainThread(UiMsg.RequestSelectableFrames, null);
        }}
        onClickShowPreview={() => {
          rootNodeInfo = undefined;
          if (!selectedFrameId) {
            console.warn("no_frame_selected");
            rootNodeInfo = null;
            return;
          }
          sendToMainThread(UiMsg.ShowPreview, { frameId: selectedFrameId });
        }}
      />

      {#if $sessionTokenStore}
        <TemplateListItem onClick={() => (view = "templates")} />
      {/if}

      {#if $sessionTokenStore && isTeamSelectorFetureEnabled}
        <OrgSelectorItem
          orgInfos={organizations}
          {selectedOrgId}
          onSelect={(orgId) => {
            selectedOrgId = orgId;
          }}
        />
      {/if}
      <About />
    </div>

    <div class="panel-footer">
      <SidebarItem isOpen={true}>
        <div slot="header">
          <div>Account</div>
        </div>
        <div slot="content">
          {#if $sessionTokenStore}
            <LogoutButton />
          {:else}
            <LoginButton />
          {/if}
        </div>
      </SidebarItem>

      <GetHelpButton />
    </div>
  </div>

  <div slot="content" class="content">
    {#if view === "templates"}
      <TemplatesView orgId={selectedOrgId} />
    {:else if view === "preview"}
      <TemplatePreviewView
        orgId={selectedOrgId}
        previewInfo={rootNodeInfo ? rootNodeInfo.config : rootNodeInfo}
        {htmlString}
        {imgHashToBlob}
        {htmlBuildLogs}
      />
    {/if}
  </div>
</BaseLayout>

<style>
  .sidebar {
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: space-between;
  }

  .panel {
    display: flex;
    flex-direction: column;
  }

  .panel-footer {
    display: flex;
    flex-direction: column;
  }
</style>
