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
  import { getMessageEventListener } from "../lib/utils/window-ev-listener-utils";
  import { replaceBgImgStyleUrlsWithBase64 } from "../lib/utils/html-string-utils";
  import About from "./sidebar/About.svelte";
  import { sessionTokenStore } from "../lib/stores/sessionTokenStore";
  import LoginButton from "./LoginButton.svelte";

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

  let rootNode: null | undefined | AppNode = null;
  let selectedFrameId: string | undefined = undefined;
  let frameSelectOptions: { id: string; name: string }[] | undefined;
  let imgHashToBlob: Record<string, Blob> = {};
  let htmlBuildLogs: {
    severity: "error" | "warning" | "info";
    message: string;
  }[] = [];

  function onMessage(event: MessageEvent) {
    const { type, data } = event.data.pluginMessage;
    switch (type) {
      case MainThreadMsg.PostFrameNodes:
        rootNode = data.node as AppNode | null;
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

  let htmlString: string | undefined = undefined;
  function onTemplateInfoChange(appNode: null | undefined | AppNode) {
    if (!appNode) {
      htmlString = undefined;
      return;
    }

    htmlString = getHtmlDocumentFromAppNode(appNode).outerHTML;
  }
  $: onTemplateInfoChange(rootNode);

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
    sendToMainThread(UiMsg.RequestSelectableFrames);
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
          sendToMainThread(UiMsg.RequestSelectableFrames);
        }}
        onClickShowPreview={() => {
          rootNode = undefined;
          sendToMainThread(UiMsg.ShowPreview, { frameId: selectedFrameId });
        }}
      />
      {#if $sessionTokenStore}
        <OrgSelectorItem
          orgInfos={organizations}
          {selectedOrgId}
          onSelect={(orgId) => {
            selectedOrgId = orgId;
          }}
        />
        <TemplateListItem onClick={() => (view = "templates")} />
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
        previewInfo={rootNode
          ? {
              width: rootNode.style.width,
              height: rootNode.style.height,
            }
          : rootNode}
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
